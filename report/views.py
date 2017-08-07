from django.shortcuts import render, redirect
from django.views.generic import View
from django.db.models import Count
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponseForbidden, JsonResponse

from entries.management.commands.backup_apis import \
    backup_weekly_snapshots

from deep.settings import BASE_DIR

from users.log import *
from leads.models import *
from entries.models import *
from report.models import *
from leads.templatetags.check_acaps import allow_acaps
from usergroup.models import UserGroup

import os
import json
import math
from datetime import datetime, timedelta


class ReportDashboardView(View):
    @method_decorator(login_required)
    def get(self, request):
        if not allow_acaps(request.user):
            return HttpResponseForbidden()

        context = {}
        context["countries"] = Country.objects.filter(
            event__usergroup__acaps=True
        ).distinct()

        country_id = request.GET.get("country")
        if not country_id:
            country_id = context["countries"][0].pk
        country = Country.objects.get(pk=country_id)

        event_id = request.GET.get("event")
        if not event_id:
            event_id = Event.objects.filter(countries__pk=country_id, usergroup__acaps=True)[0].pk
        event = Event.objects.get(pk=event_id)
        if not event.is_acaps():
            event = Event.objects.filter(countries__pk=country_id, usergroup__acaps=True)[0]
            event_id = event.pk

        dt = datetime.now()
        context["new_week_date"] = dt - timedelta(days=dt.weekday()+7)       # starting from monday, but previous week

        context["country"] = country
        context["event"] = event
        context["current_page"] = "report"

        # For event and report selection
        for country in context["countries"]:
            events = []
            country.allevents = []
            for event in Event.objects.filter(countries=country, usergroup__acaps=True).distinct():
                reports = []
                for report in WeeklyReport.objects.filter(event=event, country=country):
                    reports.append({
                        'id': report.pk,
                        'start_date': report.start_date,
                    })
                events.append({ 'id': event.pk, 'name': event.name, 'reports': reports })

                country.allevents.append(event)
            country.events = json.dumps(events, cls=DjangoJSONEncoder)

        # for sparklines and other viz
        context["affected_field_id_list"] = HumanProfileField.objects.filter(dashboard_affected_field=True)
        context["displaced_field_id_list"] = HumanProfileField.objects.filter(dashboard_displaced_field=True)
        context["in_need_field_id_list"] = PeopleInNeedField.objects.filter(dashboard_in_need_field=True)
        context["access_constraints_id_list"] = HumanAccessPinField.objects.filter(dashboard_access_constraints_field=True)
        context["human_availability_field_id_list"] = HumanProfileField.objects.filter(dashboard_availability_field=True)

        context["human_profile_fields"] = HumanProfileField.objects.all()
        context["people_in_need_fields"] = PeopleInNeedField.objects.all()
        context["human_access_fields"] = HumanAccessField.objects.all()
        context["human_access_pin_fields"] = HumanAccessPinField.objects.all()

        last_updated = os.path.getmtime(os.path.join(
            BASE_DIR, 'static/api/weekly-snapshot.json'))

        dt = datetime.now()
        context["last_updated"] = int(
            (dt - datetime.fromtimestamp(last_updated)).seconds/60
        )

        nsecs = dt.minute*60 + dt.second
        context["next_update"] = int((math.ceil(nsecs/180) * 180 - nsecs)/60)

        context["acaps_admin"] = UserGroup.objects.filter(
            admins=request.user, acaps=True).count() > 0

        return render(request, "report/dashboard.html", context)


class WeeklyReportView(View):
    @method_decorator(login_required)
    def get(self, request, country_id=None, event_id=None, report_id=None):
        if not allow_acaps(request.user):
            return HttpResponseForbidden()

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        context = {}
        context["country"] = country
        context["event"] = event
        context["entries"] = Entry.objects.filter(lead__event=event)
        context["current_page"] = "report"

        context["users"] = User.objects.exclude(first_name="", last_name="")
        UserProfile.set_last_event(request, context["event"])

        if context["event"].entry_template:
            context["entry_template"] = context["event"].entry_template
        else:
            context["pillars"] = InformationPillar.objects.all()
            context["subpillars"] = InformationSubpillar.objects.all()
            context["sectors"] = Sector.objects.all()
            context["subsectors"] = Subsector.objects.all()
            context["vulnerable_groups"] = VulnerableGroup.objects.all()
            context["specific_needs_groups"] = SpecificNeedsGroup.objects.all()
            context["reliabilities"] = Reliability.objects.all().order_by('level')
            context["severities"] = Severity.objects.all().order_by('level')
            context["affected_groups"] = AffectedGroup.objects.all()

            context["appearing_pillars"] = {}
            for field in InformationPillar.APPEAR_IN:
                context["appearing_pillars"][field[0]] = InformationPillar.objects.filter(appear_in=field[0])

            context["appearing_subpillars"] = {}
            for field in InformationSubpillar.APPEAR_IN:
                context["appearing_subpillars"][field[0]] = InformationSubpillar.objects.filter(appear_in=field[0])


        # for severity score total people in need
        context["severity_score_total_pin_id"] = PeopleInNeedField.objects.filter(severity_score_total_pin_field=True)
        context["severity_score_total_pin_human_id"] = HumanProfileField.objects.filter(severity_score_total_pin_field=True)

        # Get the report if in edit mode, otherwise get the start date of the
        # new weekly report
        if report_id:
            context["report"] = WeeklyReport.objects.get(pk=report_id)
        else:
            start_date = datetime.strptime(request.GET["start_date"], '%d-%b-%Y')
            context["start_date"] = start_date

            # Get last report
            try:
                context["last_report"] = WeeklyReport.objects.filter(event=event, country=country)[0]
            except:
                pass

        # Get field values
        context["disaster_types"] = DisasterType.objects.all()
        context["report_statuses"] = ReportStatus.objects.all()
        context["category_timelines"] = CategoryTimeline.objects.all()

        context["human_profile_fields"] = \
            HumanProfileField.objects.filter(parent__isnull=True)
        context["human_profile_field_rules"] = \
            HumanProfileFieldRule.objects.all()
        context["people_in_need_fields"] = \
            PeopleInNeedField.objects.filter(parent__isnull=True)
        context["human_access_fields"] = HumanAccessField.objects.all()
        context["human_access_pin_fields"] = HumanAccessPinField.objects.all()

        return render(request, "report/weekly.html", context)

    @method_decorator(login_required)
    def post(self, request, country_id=None, event_id=None, report_id=None):
        if not allow_acaps(request.user):
            return HttpResponseForbidden()

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        if report_id:
            report = WeeklyReport.objects.get(pk=report_id)
            activity = EditionActivity()
        else:
            report = WeeklyReport()
            activity = CreationActivity()

        report.start_date = datetime.strptime(request.POST["start_date"], '%d-%b-%Y')
        report.event = event
        report.country = country
        report.last_edited_by = request.user
        report.data = request.POST["data"]
        report.save()

        activity.set_target(
            'report', report.pk,
            report.country.name + ' for ' + report.start_date.strftime('%B %d, %Y'),
            reverse('report:weekly', args=[report.country.code, report.event.pk, report.pk])
        ).log_for(request.user, event=report.event)

        return redirect(reverse("report:dashboard") + "?country=" + country_id + "&event=" + event_id)

class DeleteWeeklyReport(View):
    @method_decorator(login_required)
    def get(self, request, country_id=None, event_id=None, report_id=None):
        report = WeeklyReport.objects.get(country=country_id, event=event_id, pk=report_id)
        activity = DeletionActivity().set_target(
            'report', report.pk,
            report.country.name + ' for ' + report.start_date.strftime('%B %d, %Y')
        )
        report.delete()
        activity.log_for(request.user, event=report.event)
        return redirect(reverse("report:dashboard") + "?country=" + country_id + "&event=" + event_id)

class MonthlyReportView(View):
    @method_decorator(login_required)
    def get(self, request):
        return render(request, "report/monthly.html")


class BackupWeeklyReportView(View):
    @method_decorator(login_required)
    def get(self, request):
        backup_weekly_snapshots()
        return JsonResponse({
            'success': True,
        })


class WeeklyReportUpdateTimesView(View):
    @method_decorator(login_required)
    def get(self, request):
        response = {
            'success': True,
        }

        last_updated = os.path.getmtime(os.path.join(
            BASE_DIR, 'static/api/weekly-snapshot.json'))

        dt = datetime.now()
        response["last_updated"] = int(
            (dt - datetime.fromtimestamp(last_updated)).seconds/60
        )

        nsecs = dt.minute*60 + dt.second
        response["next_update"] = int((math.ceil(nsecs/900) * 900 - nsecs)/60)

        return JsonResponse(response)


# EOF

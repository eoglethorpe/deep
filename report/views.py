from django.shortcuts import render, redirect
from django.views.generic import View
from django.db.models import Count, Min, Max
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from leads.models import *
from entries.models import *
from report.models import *

import collections
from math import ceil
from datetime import datetime, timedelta


class ReportDashboardView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["countries"] = Country.objects.annotate(
            num_events=Count('event')
        ).filter(num_events__gt=0)

        country_id = request.GET.get("country")
        if not country_id:
            country_id = context["countries"][0].pk

        event_id = request.GET.get("event")
        if not event_id:
            event_id = Event.objects.filter(countries__pk=country_id)[0].pk

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        # Get all weekly reports for this event and country
        weekly_reports = WeeklyReport.objects.filter(event=event, country=country)
        context["weekly_reports"] = weekly_reports

        dt = datetime.now()
        context["new_week_date"] = dt - timedelta(days=dt.weekday()+7)       # starting from monday, but previous week
        context["new_week_date_end"] = context["new_week_date"] + timedelta(days=6)
        if weekly_reports.count() > 0 and \
                weekly_reports.first().start_date >= context["new_week_date"].date():
            context["new_week_date"] = None

        for report in context["weekly_reports"]:
            report.end_date = report.start_date + timedelta(days=6)

        context["country"] = country
        context["event"] = event
        context["current_page"] = "report"

        return render(request, "report/dashboard.html", context)


class WeeklyReportView(View):
    @method_decorator(login_required)
    def get(self, request, country_id=None, event_id=None, report_id=None):

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        context = {}
        context["country"] = country
        context["event"] = event
        context["entries"] = Entry.objects.filter(lead__event=event)
        context["current_page"] = "report"

        context["users"] = User.objects.exclude(first_name="", last_name="")
        context["pillars"] = InformationPillar.objects.all()
        context["subpillars"] = InformationSubpillar.objects.all()
        context["sectors"] = Sector.objects.all()
        context["subsectors"] = Subsector.objects.all()
        context["vulnerable_groups"] = VulnerableGroup.objects.all()
        context["specific_needs_groups"] = SpecificNeedsGroup.objects.all()
        context["reliabilities"] = Reliability.objects.all().order_by('level')
        context["severities"] = Severity.objects.all().order_by('level')
        context["affected_groups"] = AffectedGroup.objects.all()
        context["sources"] = Source.objects.all()

        # Get the report if in edit mode, otherwise get the start date of the
        # new weekly report
        if report_id:
            context["report"] = WeeklyReport.objects.get(pk=report_id)
        else:
            start_date = datetime.strptime(request.GET["start_date"], '%d-%b-%Y')
            context["start_date"] = start_date

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

        context["appearing_pillars"] = {}
        for field in InformationPillar.APPEAR_IN:
            context["appearing_pillars"][field[0]] = InformationPillar.objects.filter(appear_in=field[0])

        return render(request, "report/weekly.html", context)

    @method_decorator(login_required)
    def post(self, request, country_id=None, event_id=None, report_id=None):

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        if report_id:
            report = WeeklyReport.objects.get(pk=report_id)
        else:
            report = WeeklyReport()
            report.start_date = datetime.strptime(request.POST["start_date"], '%d-%b-%Y')

        report.event = event
        report.country = country
        report.last_edited_by = request.user
        report.data = request.POST["data"]
        report.save()
        return redirect(reverse("report:dashboard") + "?country=" + country_id + "&event=" + event_id)


class MonthlyReportView(View):
    @method_decorator(login_required)
    def get(self, request):
        return render(request, "report/monthly.html")

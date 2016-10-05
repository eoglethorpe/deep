from django.shortcuts import render
from django.views.generic import View
from django.db.models import Count, Min, Max
from django.core.urlresolvers import reverse

from leads.models import *
from entries.models import *
from report.models import *

import collections
from math import ceil
from datetime import datetime, timedelta


class ReportDashboardView(View):
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
        context["new_week_date"] = dt - timedelta(days=1)       # starting from monday
        context["weekly_report_count"] = weekly_reports.count()
        context["country"] = country
        context["event"] = event

        return render(request, "report/dashboard.html", context)


class WeeklyReportView(View):
    def get(self, request, country_id=None, event_id=None, report_id=None):

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        context = {}
        context["country"] = country
        context["event"] = event
        context["entries"] = Entry.objects.filter(lead__event=event)

        if report_id:
            context["report"] = Report.objects.get(pk=report_id)
        else:
            start_date = datetime.strptime(request.GET["start_date"], '%d-%b-%Y')

        context["human_profile_fields"] = \
            HumanProfileField.objects.filter(parent__isnull=True)

        return render(request, "report/weekly.html", context)


class MonthlyReportView(View):
    def get(self, request):
        return render(request, "report/monthly.html")

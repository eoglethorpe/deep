from django.shortcuts import render
from django.views.generic import View
from django.db.models import Count

from leads.models import *
from entries.models import *


class ReportDashboardView(View):
    def get(self, request):
        context = {}
        context["countries"] = Country.objects.annotate(
            num_events=Count('event')
        ).filter(num_events__gt=0)

        country_id = request.GET.get("country")
        if not country_id:
            country_id = context["countries"][0].pk

        context["selection"] = Country.objects.get(pk=country_id)

        return render(request, "report/dashboard.html", context)

class WeeklyReportView(View):
    def get(self, request, country_id, event_id):

        country = Country.objects.get(pk=country_id)
        event = Event.objects.get(pk=event_id)

        context = {}
        context["country"] = country
        context["event"] = event
        context["entries"] = Entry.objects.filter(lead__event=event)

        return render(request, "report/weekly.html", context)


class MonthlyReportView(View):
    def get(self, request):
        return render(request, "report/monthly.html")

from django.shortcuts import render
from django.views.generic import View

from leads.models import *
from entries.models import *


class ReportDashboardView(View):
    def get(self, request):
        context = {}
        context["countries"] = Country.objects.all()
        return render(request, "report/dashboard.html", context)

class WeeklyReportView(View):
    def get(self, request):
        return render(request, "report/weekly.html")


class MonthlyReportView(View):
    def get(self, request):
        return render(request, "report/monthly.html")

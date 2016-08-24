from django.shortcuts import render
from django.views.generic import View

class ReportDashboardView(View):
    def get(self, request):
        return render(request, "report/dashboard.html")

class WeeklyReportView(View):
    def get(self, request):
        return render(request, "report/weekly.html")


class MonthlyReportView(View):
    def get(self, request):
        return render(request, "report/monthly.html")

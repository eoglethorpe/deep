from django.conf.urls import url, include
from report import views

urlpatterns = [
#    url(r'^$', views.DashboardView.as_view(), name="dashboard"),
    url(r'^weekly/$', views.WeeklyReportView.as_view(), name="weekly"),
    url(r'^monthly/$', views.MonthlyReportView.as_view(), name="monthly"),
]

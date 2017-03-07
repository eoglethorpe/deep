from django.conf.urls import url
from report.api_views import *


urlpatterns = [
        url(r'^reports/$', ReportApiView.as_view(), name="reports"),
    ]

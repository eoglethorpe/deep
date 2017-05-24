from django.conf.urls import url, include
from project.views import *


urlpatterns = [
    url(r'^details/$', ProjectDetailsView.as_view(), name="project_details"),
    url(r'^geo-area/$', GeoAreaView.as_view(), name="geo_area"),
    url(r'^analysis-framework/$', AnalysisFrameworkView.as_view(), name="analysis_framework"),
]

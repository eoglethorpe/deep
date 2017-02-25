from django.conf.urls import url
from leads.api_views import *


urlpatterns = [
        url(r'^countries/$', CountryApiView.as_view(), name="countries"),
        url(r'^events/$', EventApiView.as_view(), name="events"),
        url(r'^leads/$', LeadApiView.as_view(), name="leads"),
        url(r'^survey-of-surveys/$', SosApiView.as_view(),
            name="survey_of_surveys"),
    ]

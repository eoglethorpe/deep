from django.conf.urls import url
from .api_views import LeadViewSet, SurveyOfSurveyViewSet


urlpatterns = [
        url(r'^leads/$', LeadViewSet.as_view(), name="leads"),
        url(r'^survey-of-surveys/$', SurveyOfSurveyViewSet.as_view(),
            name="survey_of_surveys"),
    ]

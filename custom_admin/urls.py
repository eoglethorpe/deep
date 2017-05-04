from django.conf.urls import url, include
from custom_admin import views


urlpatterns = [
    url(r'^project-panel/$', views.ProjectPanelView.as_view(), name="project_panel"),
    url(r'^country-management/$', views.CountryManagementView.as_view(), name="country_management"),
    url(r'^entry-template/(?P<template_id>\d+)/$', views.EntryTemplateView.as_view(), name="entry_template"),
]

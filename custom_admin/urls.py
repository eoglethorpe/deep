from django.conf.urls import url, include
from custom_admin import views


urlpatterns = [
    url(r'^crisis-panel/$', views.CrisisPanelView.as_view(), name="crisis_panel"),
    url(r'^country-management/$', views.CountryManagementView.as_view(), name="country_management"),
    url(r'^entry-template/(?P<template_id>\d+)/$', views.EntryTemplateView.as_view(), name="entry_template"),
]

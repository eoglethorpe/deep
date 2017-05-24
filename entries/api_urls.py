from django.conf.urls import url
from entries.api_views import *


urlpatterns = [
        url(r'^entries/$', EntryApiView.as_view(), name="entries"),
    ]

from django.conf.urls import url, include
from usergroup.views import *


urlpatterns = [
    url(r'^(?P<group_slug>[\w-]+)/$', UserGroupPanelView.as_view(), name="user_group_panel"),
]

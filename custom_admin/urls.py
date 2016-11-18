from django.conf.urls import url, include
from custom_admin import views


urlpatterns = [
    url(r'^crisis-panel/$', views.CrisisPanelView.as_view(), name="crisis_panel"),
]

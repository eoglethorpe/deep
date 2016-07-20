from django.conf.urls import url, include
from entries import views


urlpatterns = [
    url(r'^$', views.EntriesView.as_view(), name="entries"),
    url(r'^add/(?P<lead_id>\d+)/$', views.AddEntry.as_view(), name='add'),
    url(r'^edit/(?P<id>\d+)/$', views.AddEntry.as_view(), name='edit'),
    url(r'^export/$', views.ExportView.as_view(), name="export"),
    url(r'^execexport/$', views.ExportExec.as_view(), name="execexport"),
]

from django.conf.urls import url, include
from leads import views


urlpatterns = [
    url(r'^$', views.LeadsView.as_view(), name="leads"),
    url(r'^add/$', views.AddLead.as_view(), name='add'),
    url(r'^add-sos/(?P<lead_id>\d+)/$', views.AddSoS.as_view(), name='add-sos'),
    url(r'^edit-sos/(?P<lead_id>\d+)/(?P<sos_id>\d+)/$', views.AddSoS.as_view(), name='edit-sos'),
    url(r'^edit/(?P<id>\d+)/$', views.AddLead.as_view(), name='edit'),
    url(r'^mark_processed/$', views.MarkProcessed.as_view(), name='mark_processed'),
    url(r'^delete/$', views.DeleteLead.as_view(), name='delete'),
    url(r'^sos/$', views.SoSView.as_view(), name="sos"),
]

from django.conf.urls import url, include
from leads import views


urlpatterns = [
    url(r'^$', views.LeadsView.as_view(), name="leads"),
    url(r'^add-manual/$', views.AddManual.as_view(), name='add-manual'),
    url(r'^add-manual/(?P<id>\d+)/$', views.AddManual.as_view(), name='add-manual'),
]

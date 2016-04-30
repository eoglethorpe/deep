from django.conf.urls import url, include
from django.contrib import admin

from rest_framework.routers import DefaultRouter

from users.views import *
from deep.views import *

from users.rest_views import *
from leads.rest_views import *


router = DefaultRouter()
router.register(r'leads', LeadViewSet, base_name='lead')
router.register(r'users', UserViewSet, base_name='lead')


urlpatterns = [
    url(r'^$', IndexView.as_view()),
    url(r'^register/$', RegisterView.as_view(), name="register"),
    url(r'^login/$', LoginView.as_view(), name="login"),
    url(r'^logout/$', LogoutView.as_view(), name="logout"),
    url(r'^dashboard/$', DashboardView.as_view(), name="dashboard"),
    url(r'^leads/', include('leads.urls', namespace='leads')),

    url(r'^admin/', admin.site.urls),

    url(r'^api/v1/', include(router.urls)),
]

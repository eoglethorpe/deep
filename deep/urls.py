from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

from users.views import *
from deep.views import *

from users.rest_views import *
from leads.rest_views import *


router = DefaultRouter()
router.register(r'leads', LeadViewSet, base_name='lead')
router.register(r'sources', SourceViewSet, base_name='source')
router.register(r'events', EventViewSet, base_name='event')
router.register(r'users', UserViewSet, base_name='user')


urlpatterns = [
    url(r'^$', IndexView.as_view()),
    url(r'^register/$', RegisterView.as_view(), name="register"),
    url(r'^login/$', LoginView.as_view(), name="login"),
    url(r'^logout/$', LogoutView.as_view(), name="logout"),
    url(r'^extension/$', ExtensionView.as_view(), name="extension"),

    url(r'^dashboard/$', DashboardView.as_view(), name="dashboard"),
    url(r'^(?P<event>\d+)/dashboard/$', DashboardView.as_view(), name="dashboard"),
    url(r'^(?P<event>\d+)/leads/', include('leads.urls', namespace='leads')),
    url(r'^(?P<event>\d+)/entries/', include('entries.urls', namespace='entries')),

    url(r'user/status/', UserStatusView.as_view(), name="status"),

    url(r'^admin/', admin.site.urls),
    url(r'^api/v1/', include(router.urls)),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

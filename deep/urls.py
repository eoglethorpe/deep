from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

# from rest_framework.routers import DefaultRouter

from users.views import *
from deep.views import *
from report.views import *

# from users.rest_views import *
# from leads.rest_views import *
# from entries.rest_views import *


# router = DefaultRouter()
# router.register(r'leads', LeadViewSet, base_name='lead')
# router.register(r'entries', EntryViewSet, base_name='entry')
# router.register(r'sources', SourceViewSet, base_name='source')
# router.register(r'events', EventViewSet, base_name='event')
# router.register(r'users', UserViewSet, base_name='user')
# router.register(r'countries', CountryViewSet, base_name='country')
# router.register(r'survey-of-surveys', SosViewSet, base_name='country')


urlpatterns = [
    url(r'^$', IndexView.as_view()),
    url(r'^register/$', RegisterView.as_view(), name="register"),
    url(r'^hid-access-token$', HidAccessToken.as_view(), name="hid_access_token"),
    url(r'^login/$', LoginView.as_view(), name="login"),
    url(r'^logout/$', LogoutView.as_view(), name="logout"),
    url(r'^extension/$', ExtensionView.as_view(), name="extension"),

    url(r'^load/countries/$', LoadCountries.as_view()),

    url(r'^dashboard/$', DashboardView.as_view(), name="dashboard"),

    url(r'^(?P<event>\d+)/dashboard/$', DashboardView.as_view(), name="dashboard"),
    url(r'^(?P<event>\d+)/leads/', include('leads.urls', namespace='leads')),
    url(r'^(?P<event>\d+)/entries/', include('entries.urls', namespace='entries')),
    url(r'^usergroup/', include('usergroup.urls', namespace='usergroup')),
    url(r'^custom-admin/', include('custom_admin.urls', namespace='custom_admin')),
    url(r'^report/', include('report.urls', namespace='report')),

    url(r'^user/(?P<user_id>\d+)', UserProfileView.as_view(), name="user_profile"),

    # API for chrome extension
    url(r'user/status/', UserStatusView.as_view(), name="status"),
    url(r'date/', DateExtractorView.as_view(), name="date"),

    url(r'^admin/', admin.site.urls),
    # url(r'^api/v1/', include(router.urls)),
    url(r'^api/v2/', include('entries.api_urls', namespace='api')),
    url(r'^api/v2/', include('leads.api_urls', namespace='api')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

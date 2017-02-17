from django.conf.urls import url
from .api_views import EntryViewSet


urlpatterns = [
        url(r'^$', EntryViewSet.as_view(), name="leads"),
    ]

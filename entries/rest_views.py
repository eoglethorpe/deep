from django.db.models import Q
from django.views.generic import View

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from leads.models import *
from entries.models import *
from entries.serializers import *


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        event = self.request.GET.get("event")
        if not event:
            return Entry.objects.filter(lead__event__in=Event.get_events_for(
                self.request.user)).distinct()
        if not Event.objects.get(pk=event).allow(self.request.user):
            return []
        if event:
            return Entry.objects.filter(lead__event__pk=event)
        return Entry.objects.all()


class EntryTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = EntryTemplateSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        events = Event.get_events_for(self.request.user)
        return EntryTemplate.objects.filter(event__in=events).distinct()

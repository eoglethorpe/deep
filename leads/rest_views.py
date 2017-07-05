from django.db.models import Q
from django.views.generic import View

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from leads.models import *
from leads.serializers import *
from entries.refresh_pcodes import *


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)



class CountryViewSet(viewsets.ModelViewSet):
    serializer_class = CountrySerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return Country.objects.all()


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        event = self.request.GET.get("event")
        if not Event.objects.get(pk=event).allow(self.request.user):
            return []
        if event:
            return Lead.objects.filter(event__pk=event)
        return Lead.objects.all()


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return Event.get_events_for(self.request.user)


class SosViewSet(viewsets.ModelViewSet):
    serializer_class = SosSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        refresh_pcodes()
        event = self.request.GET.get("event")
        if not Event.objects.get(pk=event).allow(self.request.user):
            return []
        if event:
            return SurveyOfSurvey.objects.filter(lead__event__pk=event)
        return SurveyOfSurvey.objects.all()

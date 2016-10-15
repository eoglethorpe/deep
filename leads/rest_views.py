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


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        event = self.request.GET.get("event")
        if event:
            return Lead.objects.filter(event__pk=event)
        return Lead.objects.all()


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class SosViewSet(viewsets.ModelViewSet):
    serializer_class = SosSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        refresh_pcodes()
        event = self.request.GET.get("event")
        if event:
            return SurveyOfSurvey.objects.filter(event__pk=event)
        return SurveyOfSurvey.objects.all()

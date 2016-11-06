from django.db.models import Q
from django.views.generic import View

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from leads.models import *
from entries.models import *
from entries.serializers import *


# class EntryViewSet(viewsets.ModelViewSet):
#     serializer_class = EntrySerializer
#     perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

#     def get_queryset(self):
#         event = self.request.GET.get("event")
#         if event:
#             return Entry.objects.filter(lead__event__pk=event)
#         return Entry.objects.all()

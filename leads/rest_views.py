from django.db.models import Q
from django.views.generic import View

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from leads.models import *
from leads.serializers import *


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

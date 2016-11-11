from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

from entries.models import *
from geojson_handler import GeoJsonHandler


class EntryInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryInformation
        fields = ('excerpt', 'date', 'reliability', 'severity', 'number',
                  'vulnerable_groups', 'specific_needs_groups', 'affected_groups',
                  'map_selections')
        depth = 1


class EntrySerializer(serializers.ModelSerializer):
    lead_title = serializers.CharField(source='lead.name', read_only=True)
    excerpts = EntryInformationSerializer(source='entryinformation_set', many=True)

    class Meta:
        model = Entry
        fields = ('id', 'lead', 'lead_title', 'excerpts')

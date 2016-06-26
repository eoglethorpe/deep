from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

from entries.models import *


class EntrySerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    lead_type = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = ('id', 'lead', 'lead_name', 'lead_type',
                  'excerpt', 'information_at', 'country',
                  'sectors', 'underlying_factors', 'crisis_drivers',
                  'status', 'problem_timeline', 'severity', 'reliability',
                  'map_data', 'created_at', 'created_by', 'created_by_name')

        # TODO: Automatically set created_by.

    def get_lead_name(self, entry):
        return entry.lead.name

    def get_lead_type(self, entry):
        return entry.lead.lead_type

    def get_created_by_name(self, entry):
        if entry.created_by:
            return entry.created_by.get_full_name()
        else:
            return ""


class CountrySerializer(serializers.ModelSerializer):
    admin_levels = serializers.SerializerMethodField()

    class Meta:
        model = Country
        fields = ('code', 'name', 'admin_levels')

    def get_admin_levels(self, country):
        levels = {}
        for level in country.adminlevel_set.all():
            levels["level"+str(level.level)] = [
                    level.name, level.property_name,
                    str(level.geojson.read(), 'utf-8')
                ]
        return levels

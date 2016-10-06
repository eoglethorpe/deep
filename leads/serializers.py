from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

import os

from leads.models import *


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ('source',)


class LeadSerializer(serializers.ModelSerializer):
    """ Lead serializer used by the REST api
    """

    attachment = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ('id', 'name', 'source', 'assigned_to',
                  'published_at', 'confidentiality', 'status', 'description',
                  'url', 'website', 'created_at', 'created_by', 'attachment',
                  'assigned_to_name', 'created_by_name', 'event', 'lead_type')

        # TODO: Automatically set created_by.

    def get_attachment(self, lead):
        try:
            a = lead.attachment
            return [
                    os.path.basename(a.upload.name),
                    a.upload.url
                    ]
        except:
            return None

    def get_assigned_to_name(self, lead):
        if lead.assigned_to:
            return lead.assigned_to.get_full_name()
        else:
            return ""

    def get_created_by_name(self, lead):
        if lead.created_by:
            return lead.created_by.get_full_name()
        else:
            return ""


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name',)


class SosSerializer(serializers.ModelSerializer):
    countries = serializers.SerializerMethodField()
    areas = serializers.SerializerMethodField()

    class Meta:
        model = SurveyOfSurvey
        depth = 1
        fields = ('id', 'title', 'lead_organization', 'partners',
                  'proximity_to_source', 'unit_of_analysis', 'data_collection_technique',
                  'sampling_type', 'frequency', 'status', 'confidentiality',
                  'countries', 'areas')

    def get_countries(self, entry):
        cs = [s.admin_level.country.name for s in entry.map_selections.all()]
        return list(set(cs))

    def get_areas(self, entry):
        return [s.name for s in entry.map_selections.all()] + self.get_countries(entry)

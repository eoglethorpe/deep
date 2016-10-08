from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

import os
import json

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
    created_by_name = serializers.SerializerMethodField()
    lead_id = serializers.SerializerMethodField()
    sectors_covered = serializers.SerializerMethodField()
    affected_groups = serializers.SerializerMethodField()

    class Meta:
        model = SurveyOfSurvey
        depth = 1
        fields = ('id', 'created_at', 'created_by_name',
                  'title', 'lead_organization', 'partners',
                  'proximity_to_source', 'unit_of_analysis', 'start_data_collection',
                  'end_data_collection', 'data_collection_technique',
                  'sectors_covered',
                  'sampling_type', 'frequency', 'status', 'confidentiality',
                  'countries', 'areas', 'sectors_covered', 'lead_id',
                  'affected_groups')

    def get_countries(self, entry):
        cs = [s.admin_level.country.name for s in entry.map_selections.all()]
        return list(set(cs))

    def get_areas(self, entry):
        return [s.name for s in entry.map_selections.all()] + self.get_countries(entry)

    def get_created_by_name(self, sos):
        return sos.created_by.get_full_name()

    def get_lead_id(self, sos):
        return sos.lead.pk

    def get_sectors_covered(self, sos):
        scs = json.loads(sos.sectors_covered)
        data = []
        for sc in scs:
            if sc["quantification"] or sc["analytical_value"]:
                data.append(sc["title"])

        return ", ".join(data)

    def get_affected_groups(self, sos):
        return ", ".join(json.loads(sos.affected_groups))

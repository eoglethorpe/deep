from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

from entries.models import *
from geojson_handler import GeoJsonHandler


class InformationAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformationAttribute
        fields = ('subpillar', 'sector', 'subsectors')
        depth = 2


class MapSelectionSerializer(serializers.ModelSerializer):
    keyword = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AdminLevelSelection
        fields = ('id', 'name', 'pcode', 'admin_level', 'keyword')

    def get_keyword(self, ms):
        #"{{ms.admin_level.country.code}}:{{ms.admin_level.level|add:'-1'}}:{{ms.name}}"
        return str(ms.admin_level.country.code) + ":" + str(ms.admin_level.level - 1) + ":" + str(ms.name)


class EntryInformationSerializer(serializers.ModelSerializer):
    attributes = InformationAttributeSerializer(source='informationattribute_set', many=True)
    modified_by = serializers.CharField(source='entry.modified_by.pk', read_only=True)
    modified_at = serializers.DateTimeField(source='entry.modified_at', read_only=True)
    lead_source = serializers.CharField(source='entry.lead.source_name', read_only=True)
    lead_title = serializers.CharField(source='entry.lead.name', read_only=True)
    lead_published_at = serializers.CharField(source='entry.lead.published_at', read_only=True)
    map_selections = MapSelectionSerializer(many=True)

    class Meta:
        model = EntryInformation
        fields = ('id', 'excerpt', 'date', 'reliability', 'severity', 'number',
                  'vulnerable_groups', 'specific_needs_groups', 'affected_groups',
                  'map_selections', 'attributes', 'modified_by', 'modified_at',
                  'lead_source', 'lead_title', 'lead_published_at')
        depth = 1


class EntrySerializer(serializers.ModelSerializer):
    lead_title = serializers.CharField(source='lead.name', read_only=True)
    lead_source_name = serializers.CharField(source='lead.source_name', read_only=True)
    informations = EntryInformationSerializer(source='entryinformation_set', many=True)
    modified_by = serializers.SerializerMethodField()
    lead_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Entry
        fields = ('id', 'modified_at', 'modified_by', 'lead', 'lead_title', 'lead_url', 'lead_source_name', 'informations')

    def get_modified_by(self, entry):
        return entry.modified_by.get_full_name()

    def get_lead_url(self, entry):
        if entry.lead.url and entry.lead.url != "":
            return entry.lead.url
        elif Attachment.objects.filter(lead=entry.lead).count() > 0:
            return entry.lead.attachment.upload.url
        return None

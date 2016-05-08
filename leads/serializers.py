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

    attachments = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ('id', 'name', 'source', 'assigned_to',
                  'published_at', 'confidentiality', 'status', 'description',
                  'url', 'website', 'created_at', 'created_by', 'attachments',
                  'assigned_to_name', 'created_by_name', 'event')

        # TODO: Automatically set created_by.

    def get_attachments(self, lead):
        attachments = Attachment.objects.filter(lead=lead)
        return [[
                    os.path.basename(a.upload.name),
                    a.upload.url
                ] for a in attachments]

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

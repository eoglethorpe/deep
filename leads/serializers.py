from django.contrib.auth.models import User
from rest_framework import serializers

from leads.models import *


""" Lead serializer used by the REST api
"""
class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ('id', 'name', 'source', 'content_format', 'assigned_to', 'published_at',
                  'confidentiality', 'status', 'description', 'url', 'website', 'created_by')

        #TODO: Automatically set created_by.

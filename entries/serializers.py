from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers

from entries.models import *


class EntrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Entry
        fields = ('id', 'lead', 'excerpt', 'information_at', 'country',
                  'sectors', 'underlying_factors', 'crisis_drivers',
                  'status', 'problem_timeline', 'severity', 'reliability',
                  'map_data', )

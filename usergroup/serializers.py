from rest_framework import serializers

from usergroup.models import UserGroup


class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGroup
        fields = ('id', 'name', 'photo', 'description', 'admins',
                  'owner', 'members', 'projects', 'entry_templates',
                  'slug', 'acaps')

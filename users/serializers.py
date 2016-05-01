from django.contrib.auth.models import User
from rest_framework import serializers

from users.models import *


class UserSerializer(serializers.ModelSerializer):
    """ User serializer used by REST API
    """

    email = serializers.CharField(source='username')
    organization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'password',
                  'organization')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, data):
        user = User(first_name=data['first_name'], last_name=data['last_name'],
                    username=data['email'])
        user.set_password(data['password'])
        user.save()

        profile = UserProfile()
        profile.user = user
        profile.organization = data['organization']
        profile.save()

        return user

    def get_organization(self, user):
        try:
            return UserProfile.objects.get(user=user).organization
        except:
            return ""

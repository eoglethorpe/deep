from django.db.models import Q
from django.views.generic import View

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from users.models import *
from users.serializers import *


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    perimission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return User.objects.filter(pk__in=UserProfile.objects.all().
                                   values_list('user_id'))

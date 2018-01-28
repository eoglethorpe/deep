from rest_framework import viewsets, permissions

from usergroup.serializers import UserGroupSerializer
from usergroup.models import UserGroup


class UserGroupViewSet(viewsets.ModelViewSet):
    serializer_class = UserGroupSerializer
    perimission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UserGroup.objects.all()

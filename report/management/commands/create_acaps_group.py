from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from usergroup.models import UserGroup
from leads.models import Event


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        patrice = None
        try:
            patrice = User.objects.get(username__iexact='pc@acaps.org')
        except:
            return

        acaps = None
        try:
            acaps = UserGroup.objects.get(name__iexact='ACAPS')
        except:
            acaps = UserGroup(name='ACAPS')
            acaps.owner = patrice
            acaps.acaps = True
            acaps.save()

        for project in Event.objects.all():
            if not project.entry_template:
                acaps.projects.add(project)

        for user in User.objects.filter(username__iendswith='@acaps.org'):
            acaps.members.add(user)

        acaps.admins.add(patrice)

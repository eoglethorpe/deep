from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from email.utils import parseaddr


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            if user.email is None or user.email == '':
                if '@' in parseaddr(user.username)[1]:
                    user.email = user.username
                    user.save()

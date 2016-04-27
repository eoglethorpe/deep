from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    organization = models.CharField(max_length=150)

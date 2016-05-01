from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    """ User Profile Model

    This acts as extension to the Django User model
    supporting extra user data not already supported by
    Django's User.
    """

    user = models.OneToOneField(User, primary_key=True)
    organization = models.CharField(max_length=150)

    def __str__(self):
        return str(self.user)

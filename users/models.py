from django.contrib.auth.models import User
from django.db import models

from leads.models import Event


class UserProfile(models.Model):
    """ User Profile Model

    This acts as extension to the Django User model
    supporting extra user data not already supported by
    Django's User.
    """

    user = models.OneToOneField(User, primary_key=True)
    organization = models.CharField(max_length=150)
    last_event = models.ForeignKey(Event, default=None, null=True, blank=True,
                                   on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.user)

    @staticmethod
    def set_last_event(request, event):
        try:
            profile = UserProfile.objects.get(user__pk=request.user.pk)
            profile.last_event = event
            profile.save()
        except:
            pass

    @staticmethod
    def get_last_event(request):
        return UserProfile.objects.get(user__pk=request.user.pk).last_event

    class Meta:
        verbose_name_plural = "User Profiles"

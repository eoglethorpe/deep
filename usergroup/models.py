from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

from leads.models import Event
from entries.models import EntryTemplate


class UserGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    photo = models.FileField(upload_to="group-avatar/", null=True, blank=True, default=None)
    description = models.TextField(blank=True)
    admins = models.ManyToManyField(User, related_name='groups_owned')
    owner = models.ForeignKey(User, related_name="groups_superowned", null=True, default=None)
    members = models.ManyToManyField(User)
    projects = models.ManyToManyField(Event, blank=True)
    entry_templates = models.ManyToManyField(EntryTemplate, blank=True)
    slug = models.SlugField(editable=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(UserGroup, self).save(*args, **kwargs)

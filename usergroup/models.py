from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

from leads.models import Event


class UserGroup(models.Model):
    name = models.CharField(max_length=300)
    photo = models.FileField(upload_to="group-avatar/", null=True, blank=True, default=None)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(User)
    projects = models.ManyToManyField(Event, blank=True)
    slug = models.SlugField(editable=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(UserGroup, self).save(*args, **kwargs)

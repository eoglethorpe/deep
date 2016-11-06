from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver

from leads.models import *

import json


class AdminLevel(models.Model):
    level = models.IntegerField()
    country = models.ForeignKey(Country)
    name = models.CharField(max_length=70)
    property_name = models.CharField(max_length=70)
    property_pcode = models.CharField(max_length=50, default="", blank=True)
    geojson = models.FileField(upload_to='adminlevels/')

    def __str__(self):
        return self.name + ", " + str(self.country)

    class Meta:
        ordering = ['country', 'level']
        unique_together = ('country', 'level')


@receiver(pre_delete, sender=AdminLevel)
def _admin_level_delete(sender, instance, **kwargs):
    instance.geojson.delete(False)


class AdminLevelSelection(models.Model):
    admin_level = models.ForeignKey(AdminLevel)
    name = models.CharField(max_length=70)
    pcode = models.CharField(max_length=50, default="", blank=True)

    def __str__(self):
        if self.pcode == "":
            return self.name + ", " + str(self.admin_level)
        else:
            return self.name + " (" + self.pcode + ")" + ", " + str(self.admin_level)

    class Meta:
        unique_together = ('admin_level', 'name')
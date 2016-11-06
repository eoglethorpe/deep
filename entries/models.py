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


class Reliability(models.Model):
    name = models.CharField(max_length=100)
    level = models.IntegerField()
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Severity(models.Model):
    name = models.CharField(max_length=100)
    level = models.IntegerField()
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class AffectedGroup(models.Model):
    name = models.CharField(max_length=150)
    parent = models.ForeignKey("entries.AffectedGroup", blank=True, default=None, null=True)

    def __str__(self):
        return self.name


class VulnerableGroup(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


class SpecificNeedsGroup(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


class InformationPillar(models.Model):
    name = models.CharField(max_length=150)
    contains_sectors = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class InformationSubpillar(models.Model):
    name = models.CharField(max_length=150)
    pillar = models.ForeignKey(InformationPillar)

    def __str__(self):
        return self.name


class Sector(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


class Subsector(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name


class InformationAttribute(models.Model):
    subpillar = models.ForeignKey(InformationSubpillar)
    sector = models.ForeignKey(Sector)
    subsector = models.ForeignKey(Subsector)

    def __str__(self):
        return str(self.subpillar) + "/" + str(self.sector) + "/" + str(self.subsector)


class EntryInformation(models.Model):
    excerpt = models.TextField(blank=True)
    date = models.DateField()
    reliability = models.ForeignKey(Reliability)
    severity = models.ForeignKey(Severity)
    attributes = models.ManyToManyField(InformationAttribute, blank=True)
    
    def __str__(self):
        return self.excerpt


class Entry(models.Model):
    lead = models.ForeignKey(Lead)
    informations = models.ManyToManyField(EntryInformation, blank=True)

    def __str__(self):
        return str(self.lead)
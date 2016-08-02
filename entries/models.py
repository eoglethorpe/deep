from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver

from leads.models import Lead

import json


class Country(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'countries'


class AdminLevel(models.Model):
    level = models.IntegerField()
    country = models.ForeignKey(Country)
    name = models.CharField(max_length=70)
    property_name = models.CharField(max_length=70)
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

    def __str__(self):
        return self.name + ", " + str(self.admin_level)

    class Meta:
        unique_together = ('admin_level', 'name')


class Sector(models.Model):
    name = models.CharField(max_length=70, primary_key=True)
    tags_json = models.TextField(blank=True, default="[]")

    def __str__(self):
        return self.name

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tags = json.loads(self.tags_json)


class AffectedGroup(models.Model):
    name = models.CharField(max_length=70, primary_key=True)
    parent = models.ForeignKey('AffectedGroup', null=True, blank=True)

    def __str__(self):
        return self.name


class InformationAttributeGroup(models.Model):
    name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class InformationAttribute(models.Model):
    group = models.ForeignKey(InformationAttributeGroup)
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name + " (" + str(self.group) + ")"


class VulnerableGroup(models.Model):
    name = models.CharField(max_length=70)
    min_age = models.IntegerField(default=None, blank=True, null=True)
    max_age = models.IntegerField(default=None, blank=True, null=True)

    def __str__(self):
        if not self.min_age:
            return self.name + " (< " + str(self.max_age) + " years old)"
        elif not self.max_age:
            return self.name + " (" + str(self.min_age) + "+ years old)"
        else:
            return self.name + " (" + str(self.min_age) + " to " + \
                str(self.max_age) + " years old)"

    class Meta:
        ordering = ["min_age", "max_age"]


class SpecificNeedsGroup(models.Model):
    value = models.CharField(max_length=100)

    def __str__(self):
        return self.value


class Entry(models.Model):
    lead = models.ForeignKey(Lead)

    affected_groups = models.ManyToManyField(AffectedGroup, blank=True)
    map_selections = models.ManyToManyField(AdminLevelSelection, blank=True)
    vulnerable_groups = models.ManyToManyField(VulnerableGroup, blank=True)
    sepecific_needs_groups = models.ManyToManyField(SpecificNeedsGroup, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, null=True)  # Remove null=True.

    def __str__(self):
        return str(self.lead)

    class Meta:
        verbose_name_plural = 'entries'


class AttributeData(models.Model):

    # Severity Types:
    NO_PROBLEM = "NOP"
    MINOR_PROBLEM = "MIN"
    SITUATION_OF_CONCERN = "SOC"
    SITUATION_OF_MAJOR_CONCERN = "SOM"
    SEVERE_CONDITIONS = "SEV"
    CRITICAL_SITUATION = "CRI"

    SEVERITIES = (
        (NO_PROBLEM, "No Problem"),
        (MINOR_PROBLEM, "Minor Problem"),
        (SITUATION_OF_CONCERN, "Situation of Concern"),
        (SITUATION_OF_MAJOR_CONCERN, "Situation of Major Concern"),
        (SEVERE_CONDITIONS, "Severe Conditions"),
        (CRITICAL_SITUATION, "Critical Situation"),
    )

    # Reliability Types:
    COMPLETELY = "COM"
    USUALLY = "USU"
    FAIRLY = "FAI"
    NOT_USUALLY = "NUS"
    UNRELIABLE = "UNR"
    CANNOT_BE_JUDGED = "CBJ"

    RELIABILITIES = (
        (COMPLETELY, "Completely"),
        (USUALLY, "Usually"),
        (FAIRLY, "Fairly"),
        (NOT_USUALLY, "Not Usually"),
        (UNRELIABLE, "Unreliable"),
        (CANNOT_BE_JUDGED, "Cannot be judged"),
    )

    entry = models.ForeignKey(Entry)
    attribute = models.ForeignKey(InformationAttribute)
    excerpt = models.TextField(blank=True)
    number = models.IntegerField(null=True, blank=True)
    reliability = models.CharField(max_length=3, choices=RELIABILITIES,
                                   default=None, null=True, blank=True)
    severity = models.CharField(max_length=3, choices=SEVERITIES,
                                default=None, null=True, blank=True)

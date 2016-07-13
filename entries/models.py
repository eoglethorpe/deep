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


class Entry(models.Model):

    # Status Types:
    LIVING_IN_THE_AREA = "LIA"
    AFFECTED = "AFF"
    IN_NEED = "INN"
    TARGETED = "TAR"
    REACHED = "REA"
    COVERED = "COV"

    STATUSES = (
        (LIVING_IN_THE_AREA, "Living in the area"),
        (AFFECTED, "Affected"),
        (IN_NEED, "In need"),
        (TARGETED, "Targeted"),
        (REACHED, "Reached"),
        (COVERED, "Covered"),
    )

    # Problem Timelines:
    CURRENT_PROBLEM = "CUR"
    FUTURE_PROBLEM = "FUT"
    POTENTIAL_PROBLEM = "POT"
    NO_PROBLEM = "NOP"

    PROBLEM_TIMELIES = (
        (CURRENT_PROBLEM, "Current and Confirmed Problem"),
        (FUTURE_PROBLEM, "Future Problem"),
        (POTENTIAL_PROBLEM, "Potential Problem"),
        (NO_PROBLEM, "No Problem"),
    )

    # Severity Types:
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

    lead = models.ForeignKey(Lead)

    affected_groups = models.ManyToManyField(AffectedGroup, blank=True)
    map_selections = models.ManyToManyField(AdminLevelSelection, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, null=True)  # Remove null=True.

    def __str__(self):
        return str(self.lead)

    class Meta:
        verbose_name_plural = 'entries'


class AttributeData(models.Model):

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

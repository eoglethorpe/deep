from django.db import models

from leads.models import Lead


class Country(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name


class Sector(models.Model):
    name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.name


class VulnerableGroup(models.Model):
    group_name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.group_name


class AffectedGroup(models.Model):
    group_name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.group_name


class UnderlyingFactor(models.Model):
    name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.name


class CrisisDriver(models.Model):
    name = models.CharField(max_length=70, primary_key=True)

    def __str__(self):
        return self.name


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
    excerpt = models.TextField()
    information_at = models.DateField(null=True, blank=True)
    country = models.ForeignKey(Country, null=True, blank=True)
    sectors = models.ManyToManyField(Sector, blank=True)
    underlying_factors = models.ManyToManyField(UnderlyingFactor, blank=True)
    crisis_drivers = models.ManyToManyField(CrisisDriver, blank=True)
    status = models.CharField(max_length=3, choices=STATUSES,
                              default=None, null=True, blank=True)
    problem_timeline = models.CharField(max_length=3, choices=PROBLEM_TIMELIES,
                                        default=None, null=True, blank=True)
    severity = models.CharField(max_length=3, choices=SEVERITIES,
                                default=None, null=True, blank=True)
    reliability = models.CharField(max_length=3, choices=RELIABILITIES,
                                   default=None, null=True, blank=True)
    map_data = models.TextField()

    def __str__(self):
        return str(self.lead)

    class Meta:
        verbose_name_plural = 'entries'


class VulnerableGroupData(models.Model):
    entry = models.ForeignKey(Entry)
    vulnerable_group = models.ForeignKey(VulnerableGroup)
    known_cases = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.vulnerable_group.group_name + " (" + self.known_cases + ")"


class AffectedGroupData(models.Model):
    entry = models.ForeignKey(Entry)
    affected_group = models.ForeignKey(AffectedGroup)
    known_cases = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.affected_group.group_name + " (" + self.known_cases + ")"

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator

from leads.models import *
from entries.models import *


MONTHS = (
    (1, "January"),
    (2, "February"),
    (3, "March"),
    (4, "April"),
    (5, "May"),
    (6, "June"),
    (7, "July"),
    (8, "August"),
    (9, "September"),
    (10, "October"),
    (11, "November"),
    (12, "December"),
)


class HumanProfileField(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('HumanProfileField', default=None, null=True, blank=True)

    def __str__(self):
        if self.parent:
            return self.name + " [" + self.parent.name + "]"
        return self.name


class WeeklyReport(models.Model):
    data = models.TextField(default="{}")
    start_date = models.DateField()  # start date for the week

    event = models.ForeignKey(Event)
    country = models.ForeignKey(Country)

    last_edited_by = models.ForeignKey(User)
    last_edtied_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Week at " + self.start_date

    class Meta:
        ordering = [ '-start_date' ]


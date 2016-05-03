from django.db import models

from leads.models import Lead


class Country(models.Model):
    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name


class Sector(models.Model):
    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name


class Entry(models.Model):
    lead = models.ForeignKey(Lead)
    excerpt = models.TextField()
    information_at = models.DateField(null=True, blank=True)
    country = models.ForeignKey(Country)
    sectors = models.ManyToManyField(Sector)
    # TODO: Decide appropriate ways to define rest of the fields, including
    #       locations.

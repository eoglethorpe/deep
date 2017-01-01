from django.core.management.base import BaseCommand, CommandError
from django.contrib.staticfiles import finders
from django.core.files import File
from django.db.models import Q

import os

from leads.models import *
from entries.models import *

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Get all country admin level 0 files
        directory = finders.find('files/countries/')
        for filename in os.listdir(directory):
            if filename.endswith('.geo.json'):

                # Separete filename into country name and iso codes
                temp = filename.split('.')
                country_name = temp[0]
                country_iso = temp[1]
                country_iso2 = temp[2]

                # Either find the country with given code or create a new one
                try:
                    country = Country.objects.get(
                        Q(code=country_iso) | Q(code=country_iso2)
                    )
                except:
                    country = Country(code=country_iso, name=country_name)
                    country.save()

                # Make sure the admin-level 0 file doesn't exist for this country
                admin_level = AdminLevel.objects.filter(country=country, level=0)
                if admin_level.count() > 0:
                    continue

                # Create django file for this geojson file
                file = open(os.path.join(directory, filename), 'r')
                django_file = File(file)

                # Create new admin level with this file
                admin_level = AdminLevel(country=country, level=0, name='Country',
                    property_name='NAME_ENGLI')
                admin_level.geojson.save(filename, django_file, save=True)

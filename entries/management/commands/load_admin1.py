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
        directory = finders.find('files/admin1/')
        for filename in os.listdir(directory):
            if filename.endswith('.geo.json'):

                # Separete filename into country name and iso codes
                temp = filename.split('.')
                country_name = temp[0]
                admin_name = temp[1]

                # Find the country with given name
                try:
                    country = Country.objects.get(name=country_name)
                except:
                    continue

                # Make sure the admin-level 1 doesn't already exist for this country
                admin_level = AdminLevel.objects.filter(country=country, level=1)
                if admin_level.count() > 0:
                    continue

                # Create django file for this geojson file
                file = open(os.path.join(directory, filename), 'r')
                django_file = File(file)

                # Create new admin level with this file
                admin_level = AdminLevel(country=country, level=1, name=admin_name,
                    property_name='NAME_1')
                admin_level.geojson.save(filename, django_file, save=True)

from django.core.management.base import BaseCommand  # , CommandError
from django.contrib.staticfiles import finders
from django.core.files import File
# from django.db.models import Q

import os

from leads.models import Country
from entries.models import AdminLevel


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Get all country admin level 0 files
        directory = finders.find('files/admin2/')
        for filename in os.listdir(directory):
            if filename.endswith('.geo.json'):

                # Separate filename into country name and iso codes
                temp = filename.split('%')
                country_name = temp[0]
                admin_name = temp[1][:-len('.geo.json')].replace('$or$', '/')

                # Find the country with given name
                try:
                    country = Country.objects.get(name=country_name)
                except:
                    continue

                # Get or create admin level
                try:
                    admin_level = AdminLevel.objects.get(country=country,
                                                         level=2)

                    # The old admin level files, DO NOT OVERWRITE
                    if admin_level.property_name != 'NAME_2' or\
                            admin_level.property_pcode != '':
                        continue

                    admin_level.name = admin_name
                except:
                    admin_level = AdminLevel(country=country, level=2,
                                             name=admin_name,
                                             property_name='NAME_2')

                # Create django file for this geojson file
                file = open(os.path.join(directory, filename), 'rb')
                django_file = File(file)

                # Save new admin level with this file
                admin_level.geojson.save(filename, django_file, save=True)

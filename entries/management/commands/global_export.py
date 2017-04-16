from django.core.management.base import BaseCommand, CommandError
from django.contrib.staticfiles import finders
from django.core.files import File
from django.db.models import Q

import os

from deep.settings import BASE_DIR
from leads.models import *
from entries.models import *
from entries.export_entries_xls import *

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        folder = os.path.join(BASE_DIR, 'static/global_export/')

        try:
            os.makedirs(folder)
        except:
            pass

        events = Event.objects.all()
        print('{}'.format(len(events)))
        for i, event in enumerate(events):
            print('Exporting {}'.format(i))
            export_and_save(event.pk, os.path.join(folder, '{} - {}.xls'.format(event.pk, event.name)))

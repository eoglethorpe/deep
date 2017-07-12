from django.core.management.base import BaseCommand

import os
import csv

from entries.export_entries_docx import xstr
from entries.export_entries_xls import format_date

from deep.settings import BASE_DIR
from entries.models import EntryInformation, InformationAttribute
from leads.models import Attachment


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        folder = os.path.join(BASE_DIR, 'static/global_export/')

        try:
            os.makedirs(folder)
        except:
            pass
        path = os.path.join(folder, 'lessons_learnt.csv')

        entries = EntryInformation.objects.filter(
            informationattribute__subpillar__name__icontains="lessons learnt"
        ).distinct()

        writer = csv.writer(open(path, 'w'))
        writer.writerow([
            'Date of information', 'Source', 'Excerpt', 'URL',
            'Pillar'
        ])

        for info in entries:
            try:
                lead_url = info.entry.lead.url
                if Attachment.objects.filter(lead=info.entry.lead).count() > 0:
                    lead_url = info.entry.lead.attachment.upload.url

                attributes = InformationAttribute.objects.filter(
                    information=info,
                    subpillar__name__icontains="lessons learnt"
                ).distinct()
                pillar = ','.join(a.subpillar.pillar.name for a in attributes)

                row = [
                    format_date(info.date),
                    xstr(info.entry.lead.source_name),
                    xstr(info.excerpt),
                    lead_url, pillar,
                ]

                writer.writerow(row)
            except Exception as e:
                print(e)
                pass

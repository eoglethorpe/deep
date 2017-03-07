from deep.serializer import Serializer
from report.models import *

import json


class ReportSerializer(Serializer):
    fields = {
        'id': 'pk',
        'start_date': 'start_date',
        'event': 'event',
        'country': 'country',
        'last_edited_by': 'last_edited_by.pk',
        'last_edited_by_name': 'last_edited_by.name',
        'last_edited_at': 'last_edited_at',
        'data': 'data'
    }

    def get_event(self, report):
        return { 'pk': report.event.pk, 'name': report.event.name }

    def get_country(self, report):
        return { 'code': report.country.code, 'name': report.country.name }

    def get_data(self, report):
        return json.loads(report.data)

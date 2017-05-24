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

    def __init__(self, report, get_fields=None):
        super().__init__(report)
        self.get_fields = get_fields

    def get_event(self, report):
        return { 'pk': report.event.pk, 'name': report.event.name }

    def get_country(self, report):
        return { 'code': report.country.code, 'name': report.country.name }

    def get_data(self, report):
        data = json.loads(report.data)
        if self.get_fields:
            data = { key: value for key, value in data.items() if key in self.get_fields }
        return data

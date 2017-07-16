from django.core.management.base import BaseCommand

import os
import json

from deep.settings import BASE_DIR
from deep.api_views import OverviewApiView, ReportsApiView


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        folder = os.path.join(BASE_DIR, 'static/api/')

        try:
            os.makedirs(folder)
        except:
            pass

        request = {
            'weeks': 15,
        }
        overview = OverviewApiView.get_api(request)

        overview_path = os.path.join(folder, 'overview.json')
        with open(overview_path, 'w') as fp:
            json.dump(overview, fp)

        request = {
        }
        reports = ReportsApiView.get_api(request)
        reports_path = os.path.join(folder, 'reports.json')
        with open(reports_path, 'w') as fp:
            json.dump(reports, fp)

# EOF

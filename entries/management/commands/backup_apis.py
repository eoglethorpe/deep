from django.core.management.base import BaseCommand
from django.core.serializers.json import DjangoJSONEncoder

import os
import json

from deep.settings import BASE_DIR
from deep.api_views import OverviewApiView, ReportsApiView
from report.api_views import ReportApiView
from deep.s3_storages import StaticStorage


def get_api_folder():
    if os.environ.get('USE_S3', False):
        return StaticStorage(location='static/api/')
    else:
        folder = os.path.join(BASE_DIR, 'static/api/')
        try:
            os.makedirs(folder)
        except:
            pass
        return folder


def backup_weekly_snapshots():
    folder = get_api_folder()

    request = {
        'fields': 'disaster_type',
    }
    data, _ = ReportApiView.get_json(request)
    if os.environ.get('USE_S3', False):
        with folder.open('dashboard-reports.json', 'w') as f:
            json.dump(data, f, cls=DjangoJSONEncoder)
    else:
        path = os.path.join(folder, 'dashboard-reports.json')
        with open(path, 'w') as f:
            json.dump(data, f, cls=DjangoJSONEncoder)

    data, _ = ReportApiView.get_json({})
    if os.environ.get('USE_S3', False):
        with folder.open('weekly-snapshot.json', 'w') as f:
            json.dump(data, f, cls=DjangoJSONEncoder)
    else:
        path = os.path.join(folder, 'weekly-snapshot.json')
        with open(path, 'w') as f:
            json.dump(data, f, cls=DjangoJSONEncoder)


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        folder = get_api_folder()

        request = {
            'weeks': 15,
        }
        overview = OverviewApiView.get_api(request)

        if os.environ.get('USE_S3', False):
            with folder.open('overview.json', 'w') as fp:
                json.dump(overview, fp)
        else:
            overview_path = os.path.join(folder, 'overview.json')
            with open(overview_path, 'w') as fp:
                json.dump(overview, fp)

        request = {
        }
        reports = ReportsApiView.get_api(request)
        if os.environ.get('USE_S3', False):
            with folder.open('reports.json', 'w') as fp:
                json.dump(reports, fp)
        else:
            reports_path = os.path.join(folder, 'reports.json')
            with open(reports_path, 'w') as fp:
                json.dump(reports, fp)

        backup_weekly_snapshots()

# EOF

from django.core.management.base import BaseCommand
from django.core.serializers.json import DjangoJSONEncoder
from deep.storages_utils import DeepStorage

from deep.api_views import OverviewApiView, ReportsApiView
from report.api_views import ReportApiView


def get_api_folder():
    storage = DeepStorage('static/api', 'static')
    storage.create_dirs()
    return storage


def backup_weekly_snapshots():
    storage = get_api_folder()

    request = {
        'fields': 'disaster_type',
    }
    data, _ = ReportApiView.get_json(request)
    storage.write_json('dashboard-reports.json', data,
                       cls=DjangoJSONEncoder)

    data, _ = ReportApiView.get_json({})
    storage.write_json('weekly-snapshot.json', data,
                       cls=DjangoJSONEncoder)


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        storage = get_api_folder()

        request = {
            'weeks': 15,
        }
        overview = OverviewApiView.get_api(request)

        storage.write_json('overview.json', overview)

        request = {
        }
        reports = ReportsApiView.get_api(request)
        storage.write_json('reports.json', reports)

        backup_weekly_snapshots()

# EOF

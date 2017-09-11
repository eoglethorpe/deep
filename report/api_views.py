from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View

from report.api_serializers import *
from report.models import *
from deep.json_utils import *
from deep.filename_generator import generate_filename


@method_decorator(csrf_exempt, name='dispatch')
class ReportApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        data, extra = ReportApiView.get_json(request.GET)
        response = JsonResult(data=data, extra=extra)
        if request.GET.get('file') == '1':
            response['Content-Disposition'] = 'attachment; filename="{}.json"'.format(generate_filename('Weekly Snapshot Export'))
        return response

    @staticmethod
    def get_json(request):
        reports = WeeklyReport.objects.filter(event__usergroup__acaps=True)

        event = request.get('event')
        if event:
            reports = reports.filter(event__pk=event)

        country = request.get('country')
        if country:
            reports = reports.filter(country__pk=country)

        reports = reports.distinct()

        index = request.get('index')
        if index:
            reports = reports[int(index):]
        count = request.get('count')
        if count:
            reports = reports[:int(count)]

        data = []
        for report in reports:
            if request.get('fields'):
                data.append(ReportSerializer(report, request['fields'].split(',')).serialize())
            else:
                data.append(ReportSerializer(report).serialize())

        extra = {}
        if request.get('countryEvents'):
            countries = {}
            for c in Country.objects.all():
                countries[c.pk] = {
                    'name': c.name,
                    'events': [
                        { 'pk': e.pk, 'name': e.name }
                        for e in c.event_set.all()
                    ]
                }
            extra['country_events'] = countries

        return data, extra

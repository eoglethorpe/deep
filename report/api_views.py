from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View

from report.api_serializers import *
from report.models import *
from deep.json_utils import *


@method_decorator(csrf_exempt, name='dispatch')
class ReportApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        reports = WeeklyReport.objects.all()

        event = request.GET.get('event')
        if event:
            reports = reports.filter(event__pk=event)

        country = request.GET.get('county')
        if country:
            reports = reports.filter(country__pk=country)

        index = request.GET.get('index')
        if index:
            reports = reports[int(index):]
        count = request.GET.get('count')
        if count:
            reports = reports[:int(count)]

        data = []
        for report in reports:
            data.append(ReportSerializer(report).serialize())

        extra = {}
        if request.GET.get('countryEvents'):
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

        return JsonResult(data=data, extra=extra)

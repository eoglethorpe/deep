from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View

from leads.models import Country, Event, Lead, SurveyOfSurvey
from leads.api_serializers import *
from deep.json_utils import *


@method_decorator(csrf_exempt, name='dispatch')
class CountryApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        countries = Country.objects.all()

        code = request.GET.get('code')
        if code:
            countries = countries.filter(code=code)

        index = request.GET.get('index')
        if index:
            countries = countries[int(index):]
        count = request.GET.get('count')
        if count:
            countries = countries[:int(count)]

        data = []
        for country in countries:
            data.append(CountrySerializer(country).serialize())
        return JsonResult(data=data)


@method_decorator(csrf_exempt, name='dispatch')
class EventApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        events = Event.objects.all()

        event_id = request.GET.get('id')
        if event_id:
            events = events.filter(pk=event_id)

        index = request.GET.get('index')
        if index:
            events = events[int(index):]
        count = request.GET.get('count')
        if count:
            events = events[:int(count)]

        data = []
        for event in events:
            data.append(EventSerializer(event).serialize())
        return JsonResult(data=data)


@method_decorator(csrf_exempt, name='dispatch')
class LeadApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        leads = Lead.objects.all()

        event = request.GET.get('event')
        if event:
            leads = leads.filter(event__pk=event)

        lead_id = request.GET.get('id')
        if lead_id:
            leads = leads.filter(pk=lead_id)

        index = request.GET.get('index')
        if index:
            leads = leads[int(index):]
        count = request.GET.get('count')
        if count:
            leads = leads[:int(count)]

        data = []
        for lead in leads:
            data.append(LeadSerializer(lead).serialize())

        return JsonResult(data=data)


@method_decorator(csrf_exempt, name='dispatch')
class SosApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        soses = SurveyOfSurvey.objects.all()

        event = request.GET.get('event')
        if event:
            soses = soses.filter(lead__event__pk=event)

        sos_id = request.GET.get('id')
        if sos_id:
            soses = soses.filter(pk=sos_id)

        index = request.GET.get('index')
        if index:
            soses = soses[int(index):]
        count = request.GET.get('count')
        if count:
            soses = soses[:int(count)]

        data = []
        for sos in soses:
            data.append(SosSerializer(sos).serialize())
        return JsonResult(data=data)

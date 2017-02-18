from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from .models import Lead, SurveyOfSurvey
from .api_serializers import LeadSerializer, SosSerializer

from deep.json_utils import *


@method_decorator(csrf_exempt, name='dispatch')
class LeadViewSet(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        event = request.GET.get("event")
        if event:
            objects = Lead.objects.filter(event__pk=event)
        else:
            objects = Lead.objects

        data = []
        for object in objects.all():
            data.append(LeadSerializer(object).serialize())
        return JsonResult(data=data)


@method_decorator(csrf_exempt, name='dispatch')
class SurveyOfSurveyViewSet(View):

    def post(self, request):
        return JsonMethodNotAllowed(request)

    def get(self, request):
        event = request.GET.get("event")
        if event:
            # Filter with given event
            objects = SurveyOfSurvey.objects.filter(lead__event__pk=event)
        else:
            objects = SurveyOfSurvey.objects

        data = []
        # Iterate throught all objects
        for object in objects.all():
            # Push serialized lead to array
            data.append(SosSerializer(object).serialize())
        # Response as Json
        return JsonResult(data=data)

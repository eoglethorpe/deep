from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from .models import Entry
from .api_serializers import EntrySerializer

from deep.json_utils import *


@method_decorator(csrf_exempt, name='dispatch')
class EntryViewSet(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        # View Logic Starts
        event = request.GET.get("event")
        if event:
            # Filter with given event
            objects = Entry.objects.filter(lead__event__pk=event)
        else:
            objects = Entry.objects

        data = []
        # Iterate throught all objects
        for object in objects.all():
            # Push serialized entry to array
            data.append(EntrySerializer(object).serialize())
        # Response as Json
        return JsonResult(data=data)

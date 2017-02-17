from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from deep.utils import JsonMethodNotAllowed, JsonResult
from django.views.generic import View
from .models import Entry
from .api_serializers import entry_serializer


@method_decorator(csrf_exempt, name='dispatch')
class EntryViewSet(View):

    def post(self, request):
        return JsonMethodNotAllowed(request)

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
            data.append(entry_serializer(object))
        # Response as Json
        return JsonResult(data=data)

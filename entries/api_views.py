from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View

from entries.models import Entry
from entries.api_serializers import *
from deep.json_utils import *


@method_decorator(csrf_exempt, name='dispatch')
class EntryApiView(View):

    def post(self, request):
        return JSON_METHOD_NOT_ALLOWED

    def get(self, request):
        entries = Entry.objects.all()

        event = request.GET.get('event')
        if event:
            entries = entries.filter(lead__event__pk=event)

        entry_id = request.GET.get('id')
        if entry_id:
            entries = entries.filter(pk=entry_id)

        data = []
        for entry in entries:
            data.append(EntrySerializer(entry).serialize())

        # Extra requests
        extra = None
        extra_requests = request.GET.get('extra')
        if extra_requests:
            extra_requests = extra_requests.split(',')
            extra = {}

            if 'pillars' in extra_requests:
                extra['pillars'] = []
                for pillar in InformationPillar.objects.all():
                    extra['pillars'].append(PillarSerializer(pillar).serialize())

            if 'subpillars' in extra_requests:
                extra['subpillars'] = []
                for subpillar in InformationSubpillar.objects.all():
                    extra['subpillars'].append(SubpillarSerializer(subpillar).serialize())

            if 'sectors' in extra_requests:
                extra['sectors'] = []
                for sector in Sector.objects.all():
                    extra['sectors'].append(SectorSerializer(sector).serialize())

            if 'subsectors' in extra_requests:
                extra['subsectors'] = []
                for subsector in Subsector.objects.all():
                    extra['subsectors'].append(SubsectorSerializer(subsector).serialize())

        return JsonResult(data=data, extra=extra)

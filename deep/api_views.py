from django.http import JsonResponse
from django.views.generic import View
from django.contrib.auth.models import User

from leads.models import Country, Event, Lead, SurveyOfSurvey
from entries.models import EntryInformation


class OverviewApiView(View):
    def get(self, request):
        try:
            return JsonResponse(self.get_api(request))
        except Exception as e:
            print(e)
            return JsonResponse({'status': False}, status=500)

    def get_api(self, request):
        response = {}
        response['status'] = True

        data = {}

        # Basic Data
        data['active_countries'] = [
            c.code for c in
            Country.objects.filter(reference_country=None,
                                   event__status=1,
                                   event__usergroup__acaps=True).distinct()
        ]
        data['countries_monitored'] = [
            c.code for c in
            Country.objects.filter(reference_country=None,
                                   event__status=0,
                                   event__usergroup__acaps=True).distinct()
        ]
        data['leads'] = Lead.objects.filter(event__usergroup__acaps=True)\
            .distinct().count()
        data['entries'] = EntryInformation.objects.filter(
            entry__lead__event__usergroup__acaps=True).distinct().count()
        data['assessment_reports'] = SurveyOfSurvey.objects.filter(
            lead__event__usergroup__acaps=True).distinct().count()
        data['registered_users'] = User.objects.filter(usergroup__acaps=True)\
            .distinct().count()

        # Data from reports
        severe = 0
        data['severe'] = severe

        response['data'] = data
        return response

from django.http import JsonResponse
from django.views.generic import View
from django.contrib.auth.models import User
from django.db.models import Max, F

from leads.models import Country, Lead, SurveyOfSurvey
from entries.models import EntryInformation
from report.models import WeeklyReport, PeopleInNeedField, \
    HumanProfileField, HumanAccessPinField

import json
from datetime import datetime, timedelta


def get_pin(data):
    fields = PeopleInNeedField.objects.filter(dashboard_in_need_field=True)
    return max([int(data['people']['total'][str(field.pk)])
               for field in fields
               if data['people']['total'].get(str(field.pk))], default=0)


def get_pin_severe(data):
    fields = PeopleInNeedField.objects.filter(dashboard_in_need_field=True)
    return max([int(data['people']['severe'][str(field.pk)])
               for field in fields
               if data['people']['severe'].get(str(field.pk))], default=0)


def get_idps(data):
    field = HumanProfileField.objects.filter(dashboard_idp_field=True)
    if field:
        if data['human']['number'].get(str(field[0].pk)):
            return int(data['human']['number'][str(field[0].pk)])
    return 0


def get_refugees(data):
    field = HumanProfileField.objects.filter(dashboard_refugees_field=True)
    if field:
        if data['human']['number'].get(str(field[0].pk)):
            return int(data['human']['number'][str(field[0].pk)])
    return 0


def get_pin_restricted(data):
    fields = HumanAccessPinField.objects.filter(
        dashboard_access_constraints_field=True)
    return sum([int(data['access-pin']['number'][str(field.pk)])
               for field in fields
               if data['access-pin']['number'].get(str(field.pk))])


def get_people_affected(data):
    fields = HumanProfileField.objects.filter(dashboard_affected_field=True)
    return sum([int(data['human']['number'][str(field.pk)])
               for field in fields
               if data['human']['number'].get(str(field.pk))])


class OverviewApiView(View):
    def get(self, request):
        try:
            return JsonResponse(self.get_api(request))
        except Exception as e:
            raise(e)
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
        data['current_users'] = User.objects.filter(usergroup__acaps=True)\
            .distinct().count()

        latest_reports = WeeklyReport.objects.annotate(
            max_date=Max('event__weeklyreport__start_date')
        ).filter(start_date=F('max_date'))

        # Latest report data

        severe = 0
        humanitarian_crises = 0
        situation_of_concern = 0

        for report in latest_reports:
            report.data = json.loads(report.data)

            score = report.data['final-severity-score']['score']
            if score == '3':
                severe += 1
            elif score == '2':
                humanitarian_crises += 1
            elif score == '1':
                situation_of_concern += 1

        data['severe'] = severe
        data['humanitarian_crises'] = humanitarian_crises
        data['situation_of_concern'] = situation_of_concern

        # Report data for last 15 days

        pin = []
        pin_severe = []
        idps = []
        refugees = []
        pin_restricted = []
        people_affected = []

        dt = datetime.now()
        dt = dt - timedelta(days=dt.weekday() + 7)

        num_weeks = request.GET.get('weeks')
        if not num_weeks:
            num_weeks = 15

        for i in range(int(num_weeks)):
            date = dt - timedelta(days=i*7)
            reports = WeeklyReport.objects.filter(start_date=date)

            pin.append(0)
            pin_severe.append(0)
            idps.append(0)
            refugees.append(0)
            pin_restricted.append(0)
            people_affected.append(0)

            for report in reports:
                report.data = json.loads(report.data)

                pin[-1] += get_pin(report.data)
                pin_severe[-1] += get_pin_severe(report.data)
                idps[-1] += get_idps(report.data)
                refugees[-1] += get_refugees(report.data)
                pin_restricted[-1] += get_pin_restricted(report.data)
                people_affected[-1] += get_people_affected(report.data)

        data['pin'] = pin
        data['pin_severe'] = pin_severe
        data['idps'] = idps
        data['refugees'] = refugees
        data['pin_restricted'] = pin_restricted
        data['people_affected'] = people_affected

        response['data'] = data
        return response

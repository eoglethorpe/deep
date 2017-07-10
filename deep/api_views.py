from django.http import JsonResponse
from django.views.generic import View
from django.contrib.auth.models import User
from django.db.models import Max, F

from leads.models import Country, Lead, SurveyOfSurvey, Event
from entries.models import EntryInformation
from report.models import WeeklyReport, PeopleInNeedField, \
    HumanProfileField, HumanAccessPinField

import json
from datetime import datetime, timedelta


def parse_datetime(datestr):
    return datetime.strptime(datestr, '%Y-%m-%d')


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

        severe = []
        humanitarian_crises = []
        situation_of_concern = []

        for report in latest_reports:
            report.data = json.loads(report.data)

            score = report.data['final-severity-score']['score']
            if score == '3':
                severe.append(report.country.code)
            elif score == '2':
                humanitarian_crises.append(report.country.code)
            elif score == '1':
                situation_of_concern.append(report.country.code)

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


class ReportsApiView(View):
    def get(self, request):
        try:
            return JsonResponse(self.get_api(request))
        except Exception as e:
            return JsonResponse({'status': False}, status=500)

    def get_api(self, request):
        response = {}
        response['status'] = True
        data = []

        countries = Country.objects.filter(
            weeklyreport__event__usergroup__acaps=True)

        cquery = request.GET.get('countries')
        if cquery:
            country_codes = cquery.split(',')
            countries = countries.filter(code__in=country_codes)

        countries = countries.distinct()
        for country in countries:
            data.append(self.get_country_data(request, country))

        response['data'] = data
        return response

    def get_country_data(self, request, country):
        data = {}
        data['country_code'] = country.code
        data['country'] = country.name

        data['leads'] = Lead.objects.filter(
            event__countries=country,
            event__usergroup__acaps=True
        ).distinct().count()

        data['entries'] = EntryInformation.objects.filter(
            entry__lead__event__countries=country,
            entry__lead__event__usergroup__acaps=True
        ).distinct().count()

        data['assessment_reports'] = SurveyOfSurvey.objects.filter(
            lead__event__countries=country,
            lead__event__usergroup__acaps=True
        ).distinct().count()

        projects = Event.objects.filter(countries=country)
        data['projects'] = [
            {'id': p.id, 'name': p.name} for p in projects
        ]

        start_date = datetime.now().date().replace(month=1, day=1)
        if request.GET.get('start_date'):
            start_date = parse_datetime(request.GET.get('start_date'))

        reports = WeeklyReport.objects.filter(
            country=country,
            event__usergroup__acaps=True,
            start_date__gte=start_date
        )

        end_date = request.GET.get('end_date')
        if end_date:
            end_date = parse_datetime(end_date)
            reports = reports.filter(start_date__lte=end_date)

        modified_start_date = request.GET.get('modified_start_date')
        if modified_start_date:
            modified_start_date = parse_datetime(modified_start_date)
            reports = reports.filter(last_edited_at__gte=modified_start_date)

        modified_end_date = request.GET.get('modified_end_date')
        if modified_end_date:
            modified_end_date = parse_datetime(modified_end_date)
            reports = reports.filter(last_edited_at__lte=modified_end_date)

        reports = reports.distinct()

        disaster_type = request.GET.get('disaster_type')

        data['reports'] = []
        for report in reports:
            report.data = json.loads(report.data)

            if disaster_type and \
                    int(report.data['disaster_type']) != int(disaster_type):
                continue

            rdata = {}
            rdata['id'] = report.pk
            rdata['week_date'] = datetime.strftime(report.start_date,
                                                   '%Y-%m-%d')
            rdata['modified_date'] = datetime.strftime(report.last_edited_at,
                                                       '%Y-%m-%d')
            rdata['project_id'] = report.event.pk
            rdata['disaster_type'] = int(report.data['disaster_type'])
            rdata['pin'] = get_pin(report.data)
            rdata['pin_severe'] = get_pin_severe(report.data)
            rdata['idps'] = get_idps(report.data)
            rdata['refugees'] = get_refugees(report.data)
            rdata['pin_restricted'] = get_pin_restricted(report.data)
            rdata['people_affected'] = get_people_affected(report.data)

            data['reports'].append(rdata)

        return data

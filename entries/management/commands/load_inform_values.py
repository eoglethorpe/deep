from django.core.management.base import BaseCommand, CommandError
from leads.models import *

import requests
import json


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        countries = Country.objects.all()
        for country in countries:

            print('Loading from: {} - {}'.format(country.name, country.code))

            # Get JSON data from INFORM API
            url = 'http://139.191.244.117/GNASYSTEM/api001.aspx'
            params = dict(
                request='GetResultsWFPublished',
                workflow='261',
                ListIso3=country.code
            )
            resp = requests.get(url=url, params=params)
            raw_text = resp.text.replace('""', '", "')
            data = json.loads(raw_text)
            results = data['ResultsWFPublished']

            if len(results) == 0:
                print('Not found')
                continue

            # Get keyfigures
            hdi_index = next((result for result in results if result['IndicatorId'] == 'HDI'), None)
            if hdi_index:
                country.hdi_index = hdi_index['IndicatorScore']

            u5m = next((result for result in results if result['IndicatorId'] == 'CM'), None)
            if u5m:
                country.u5m = u5m['IndicatorScore']

            refugees = next((result for result in results if result['IndicatorId'] == 'VU.VGR.UP.REF-TOT'), None)
            if refugees:
                country.number_of_refugees = refugees['IndicatorScore']

            idps = next((result for result in results if result['IndicatorId'] == 'VU.VGR.UP.IDP-TOT'), None)
            if idps:
                country.number_of_idps = idps['IndicatorScore']
                if country.number_of_idps == -99:
                    country.number_of_idps = 0

            returned_refugees = next((result for result in results if result['IndicatorId'] == 'RET_REF'), None)
            if returned_refugees:
                country.number_of_returned_refugees = returned_refugees['IndicatorScore']

            inform_risk_index = next((result for result in results if result['IndicatorId'] == 'INFORM'), None)
            if inform_risk_index:
                country.inform_risk_index = inform_risk_index['IndicatorScore']

            inform_hazard_and_exposure = next((result for result in results if result['IndicatorId'] == 'HA'), None)
            if inform_hazard_and_exposure:
                country.inform_hazard_and_exposure = inform_hazard_and_exposure['IndicatorScore']

            inform_vulnerability = next((result for result in results if result['IndicatorId'] == 'VU'), None)
            if inform_vulnerability:
                country.inform_vulnerability = inform_vulnerability['IndicatorScore']

            inform_lack_of_coping_capacity = next((result for result in results if result['IndicatorId'] == 'CC'), None)
            if inform_lack_of_coping_capacity:
                country.inform_lack_of_coping_capacity = inform_lack_of_coping_capacity['IndicatorScore']

            total_population = next((result for result in results if result['IndicatorId'] == 'POP'), None)
            if total_population:
                country.total_population = total_population['IndicatorScore']

            country.save()
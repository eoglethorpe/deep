from django.core.management.base import BaseCommand
from leads.models import Country
import csv
import json


def get_dict_from_csv(filename, key):
    """
    convert csv to json
    key specifies field for each row
    first row gives keys(fields) key gives key
    remaining row gives value

    for key = 'ISO3'
    <<
    name, ISO3, ...other
    nepal, nep, ...other
    america, USA, ...other

    >>
    {'NEP': {'name': 'nepal, ...other},
    'USA': {'name': 'america', ...other}, ...other}
    """
    with open(filename) as csvfile:

        spamreader = list(csv.reader(csvfile, delimiter=',', quotechar='"'))
        # json/dict field/key
        fields = []
        # json/dict
        data = {}
        # key index in csv array[e.g: iso3 is Country Code]
        key_index = -1

        # Get all the fields and iso3 index from first row
        for index, field in enumerate(spamreader[0]):
            if field == key:
                key_index = index
            fields.append(field)

        # For now no exception raised
        if key_index == -1:
            return []

        # Generate json/dict from remaining row
        for row in spamreader[1:]:
            _row = {}
            for index, field in enumerate(fields):
                if field == key:
                    continue
                _row[field] = row[index]
            data[row[key_index]] = _row
        return data


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        countries = Country.objects.all()
        print('Loading Region List....')
        regions = get_dict_from_csv('static/files/region_list.csv', 'ISO3')
        for country in countries:
            region_data = regions.get(country.code)
            if region_data:
                country.regions = json.dumps(region_data)
                print('Saving Region Data to country: '+country.name)
                country.save()

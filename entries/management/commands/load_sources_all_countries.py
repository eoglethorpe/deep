from django.core.management.base import BaseCommand
from leads.models import Country
import csv
import json


def get_local_media(filename):
    """
    For all get_* method
    {
        'Afghanistan': [
                {'name':'hello','link':'http...'},
                {'name':'hello1','link':'http...'},
            ],
        'Nepal' :[
                ....
        ],
            .....
        }
    """
    with open(filename) as csvfile:
        spamreader = list(csv.reader(csvfile, delimiter=',', quotechar='"'))
        data = {}
        for row in spamreader:
            media = {
                'name': row[1],
                'link': row[2],
                'languages': row[3],
                }

            if data.get(row[0], None):
                data[row[0]].append(media)
            else:
                data[row[0]] = [media]

        return data


def get_twitter(filename):
    with open(filename) as csvfile:
        spamreader = list(csv.reader(csvfile, delimiter=',', quotechar='"'))
        data = {}
        for row in spamreader:
            twitter = {
                'name': row[2],
                'link': row[1],
                }

            if data.get(row[0], None):
                data[row[0]].append(twitter)
            else:
                data[row[0]] = [twitter]

        return data


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        countries = Country.objects.all()

        print('Loading Media Sources....')
        media = get_local_media('static/files/sources_local_media.csv')
        print('Loading Twitter Sources....')
        twitter = get_twitter('static/files/sources_twitter.csv')

        for country in countries:
            media_data = media.get(country.name)
            twitter_data = twitter.get(country.name)

            if media_data:
                country.media_sources = json.dumps({
                         'Newspaper': media_data,
                         'Twitter': twitter_data,
                      })
                print('Saving Region Data to country: '+country.name)
                country.save()

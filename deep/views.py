from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View  # ,TemplateView
from django.http import JsonResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
# from django.conf import settings

import os
import requests
import json
# import tempfile
import cgi
# import time

from leads.models import Event, Country, Lead
# from entries.models import *
from deep.filename_generator import generate_filename
from deep.storages_utils import TempDownloadStorage

import date_extractor


class IndexView(View):
    def get(self, request):
        return redirect('login')


class ExtensionView(View):
    def get(self, request):
        return render(request, "deep/extension.html")


class LoadCountries(View):
    @method_decorator(staff_member_required)
    def get(self, request):
        r = requests.get("http://country.io/names.json")
        data = json.loads(r.text)
        for code in data:
            try:
                country = Country.objects.get(code=code)
            except:
                country = Country()
                country.code = code
                country.name = data[code]
                country.save()
        return HttpResponse("Success !")


class DateExtractorView(View):
    def get(self, request):
        link = request.GET['link']

        # Also get the date and check if lead already exists for this link
        date, source, country = date_extractor.\
            extractArticlePublishedDate(link)
        if not date:
            date = ""
        else:
            date = date.strftime("%Y-%m-%d")

        event = None
        if country:
            try:
                event = Event.objects.filter(
                        countries__name__iexact=country)[0].pk
            except:
                event = None

        exists = Lead.objects.filter(url=link)
        return JsonResponse({'date': date, 'source': source,
                             'lead_exists': exists.count() > 0,
                             'event': event})


class DownloadFileView(View):
    def get(self, request):
        # Delete all temporary files that are beyond 30 minutes old(For non S3)
        TempDownloadStorage.clean_files()

        filename = request.GET.get('filename')
        path = request.GET.get('path')
        if filename and path:
            response = HttpResponse(content_type=request.GET
                                    .get('content_type'))
            response['Content-Disposition'] = 'attachment; filename = "{}"'.\
                format(filename)
            response.write(TempDownloadStorage.open(path, 'rb').read())
            return response

        url = request.GET['url']
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; '
                                 'Intel Mac OS X 10_10_1) AppleWebKit/537.36'
                                 ' (KHTML, like Gecko) Chrome/39.0.2171.95 '
                                 'Safari/537.36'}
        with TempDownloadStorage.open_temp() as fp:
            response = requests.get(url, stream=True, headers=headers)
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    fp.write(chunk)

        params = cgi.parse_header(response.headers
                                  .get('Content-Disposition', ''))[-1]
        return JsonResponse({
            'path': fp.name.rsplit('/')[-1],
            'filename': os.path.basename(params['filename'])
            if 'filename' in params else generate_filename('Download'),
            'content_type': response.headers.get('Content-Type'),
        })

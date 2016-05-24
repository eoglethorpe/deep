from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator

import requests
import json

from entries.models import *


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

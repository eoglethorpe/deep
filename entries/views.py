from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from leads.models import *
from entries.models import *


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["current_page"] = "entries"
        return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, id=None):
        context = {}
        context["current_page"] = "entries"

        if "lead" in request.GET:
            context["lead"] = Lead.objects.get(pk=int(request.GET["lead"]))
        return render(request, "entries/add-entry.html", context)

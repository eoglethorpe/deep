from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from entries.models import *


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()
        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, event, id=None):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()
        UserProfile.set_last_event(request, context["event"])

        if "lead" in request.GET:
            context["lead"] = Lead.objects.get(pk=int(request.GET["lead"]))
        return render(request, "entries/add-entry.html", context)

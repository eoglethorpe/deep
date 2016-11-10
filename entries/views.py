from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse

from users.models import *
from leads.models import *
from entries.models import *
from entries.strippers import *
# from . import export_xls, export_docx, export_fields
from entries.refresh_pcodes import *
from leads.views import get_simplified_lead

import os
import json
from collections import OrderedDict


class ExportView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        # context = {}
        # context["current_page"] = "export"
        # context["event"] = Event.objects.get(pk=event)
        # context["all_events"] = Event.objects.all()

        # UserProfile.set_last_event(request, context["event"])
        return HttpResponse("To be updated") # render(request, "entries/export.html", context)


class ExportXls(View):
    @method_decorator(login_required)
    def get(self, request, event):
        # response = HttpResponse(content = export_xls.export(), content_type='application/vnd.ms-excel')
        # response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('xls')

        return HttpResponse("To be updated") # response


class ExportDocx(View):
    @method_decorator(login_required)
    def get(self, request, event):
        # order = request.GET.get("order").split(',')
        # order_values = {
        #     "geoarea": "Map Selections",
        #     "affected": "Affected Groups",
        #     # "reliability": "Reliability",
        #     # "severity": "Severity",
        #     # "sector": "Sector",
        # }
        # ord = [order_values[a] for a in order if a in order_values]

        # # ord = ["Map Selections", "Affected Groups", "Vulnerable Groups"]
        # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        # response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('doc')
        # export_docx.export(ord).save(response)

        return HttpResponse("To be updated") # response


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
    def get(self, request, event, lead_id=None, id=None):
        refresh_pcodes()

        if not id:
            lead = Lead.objects.get(pk=lead_id)

        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["dummy_list"] = range(5)
        # context["all_events"] = Event.objects.all()

        context["lead"] = lead
        get_simplified_lead(lead, context)

        context["pillars_one"] = InformationPillar.objects.filter(contains_sectors=False)
        context["pillars_two"] = InformationPillar.objects.filter(contains_sectors=True)
        context["sectors"] = Sector.objects.all()
        context["vulnerable_groups"] = VulnerableGroup.objects.all()
        context["specific_needs_groups"] = SpecificNeedsGroup.objects.all()
        context["reliabilities"] = Reliability.objects.all().order_by('level')
        context["severities"] = Severity.objects.all().order_by('level')
        try:
            context["default_reliability"] = Reliability.objects.get(is_default=True)
            context["default_severity"] = Reliability.objects.get(is_default=True)
        except:
            pass

        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/add-entry.html", context)


class DeleteEntry(View):
    @method_decorator(login_required)
    def post(self, request, event):
        # entry = Entry.objects.get(pk=request.POST["id"])
        # entry.delete()
        return redirect('entries:entries', event=event)

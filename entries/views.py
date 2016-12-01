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
from entries.export_entries_docx_temp import export_docx
from entries.refresh_pcodes import *
from leads.views import get_simplified_lead

import os
import json
import time
from collections import OrderedDict


class ExportView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "export"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()

        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/export.html", context)


class ExportXls(View):
    @method_decorator(login_required)
    def get(self, request, event):
        # response = HttpResponse(content = export_xls.export(), content_type='application/vnd.ms-excel')
        # response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('xls')

        return HttpResponse("To be updated") # response


class ExportDocx(View):
    @method_decorator(login_required)
    def get(self, request, event):
        order = request.GET.get("order").split(',')
        # order_values = {
        #     "geoarea": "Map Selections",
        #     "affected": "Affected Groups",
        #     # "reliability": "Reliability",
        #     # "severity": "Severity",
        #     # "sector": "Sector",
        # }
        # order = [order_values[a] for a in order if a in order_values]

        # # ord = ["Map Selections", "Affected Groups", "Vulnerable Groups"]
        # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        # response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('doc')
        # export_docx.export(ord).save(response)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        response['Content-Disposition'] = 'attachment; filename = DEEP Entries-%s.docx' % time.strftime("%Y-%m-%d")
        export_docx(order, int(event)).save(response)

        return response


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()

        context["users"] = User.objects.exclude(first_name="", last_name="")
        context["pillars"] = InformationPillar.objects.all()
        context["subpillars"] = InformationSubpillar.objects.all()
        context["sectors"] = Sector.objects.all()
        context["subsectors"] = Subsector.objects.all()
        context["vulnerable_groups"] = VulnerableGroup.objects.all()
        context["specific_needs_groups"] = SpecificNeedsGroup.objects.all()
        context["reliabilities"] = Reliability.objects.all().order_by('level')
        context["severities"] = Severity.objects.all().order_by('level')
        context["affected_groups"] = AffectedGroup.objects.all()
        context["sources"] = Source.objects.all()

        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, event, lead_id=None, id=None):
        refresh_pcodes()
        context = {}

        if not id:
            lead = Lead.objects.get(pk=lead_id)
            lead_entry = Entry.objects.filter(lead=lead)
            if lead_entry.count() > 0:
                return redirect('entries:edit', event, lead_entry[0].pk)
        else:
            entry = Entry.objects.get(pk=id)
            lead = entry.lead
            context["entry"] = entry

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
        context["affected_groups"] = AffectedGroup.objects.all()
        try:
            context["default_reliability"] = Reliability.objects.get(is_default=True)
            context["default_severity"] = Severity.objects.get(is_default=True)
        except:
            pass

        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/add-entry.html", context)

    @method_decorator(login_required)
    def post(self, request, event, lead_id=None, id=None):
        if not id:
            lead = Lead.objects.get(pk=lead_id)
        else:
            entry = Entry.objects.get(pk=id)
            lead = entry.lead

        excerpts = json.loads(request.POST["excerpts"]);

        lead_entries = Entry.objects.filter(lead=lead)
        if lead_entries.count() > 0:
            entry = lead_entries[0]
            entry.entryinformation_set.all().delete()
        else:
            entry = Entry(lead=lead)
            
        entry.modified_by = request.user
        entry.save()

        for excerpt in excerpts:
            information = EntryInformation(entry=entry)
            information.excerpt = excerpt["excerpt"]

            information.reliability = Reliability.objects.get(pk=int(excerpt["reliability"]))
            information.severity = Severity.objects.get(pk=int(excerpt["severity"]))
            if excerpt["number"]:
                information.number = int(excerpt["number"])
            if excerpt["date"]:
                information.date = excerpt["date"]
            information.save()

            for ag in excerpt["affected_groups"]:
                information.affected_groups.add(AffectedGroup.objects.get(pk=int(ag)))
            for vg in excerpt["vulnerable_groups"]:
                information.vulnerable_groups.add(VulnerableGroup.objects.get(pk=int(vg)))
            for sg in excerpt["specific_needs_groups"]:
                information.specific_needs_groups.add(SpecificNeedsGroup.objects.get(pk=int(sg)))

            for area in excerpt["map_selections"]:
                m = area.split(':')
                admin_level = AdminLevel.objects.get(
                    country=Country.objects.get(code=m[0]),
                    level=int(m[1])+1
                )
                try:
                    if len(m) == 4:
                        selection = AdminLevelSelection.objects.get(
                            admin_level=admin_level, pcode=m[3]
                        )
                    else:
                        selection = AdminLevelSelection.objects.get(
                            admin_level=admin_level, name=m[2]
                        )
                except:
                    if len(m) == 4:
                        selection = AdminLevelSelection(admin_level=admin_level,
                                                        name=m[2], pcode=m[3])
                    else:
                        selection = AdminLevelSelection(admin_level=admin_level,
                                                        name=m[2])
                    selection.save()

                information.map_selections.add(selection)

            for attr in excerpt["attributes"]:
                ia = InformationAttribute()
                ia.information = information
                ia.subpillar = InformationSubpillar.objects.get(pk=int(attr["subpillar"]))
                if attr["sector"]:
                    ia.sector = Sector.objects.get(pk=int(attr["sector"]))
                ia.save()

                if "subsectors" in attr and attr["subsectors"]:
                    for subsector in attr["subsectors"]:
                        ia.subsectors.add(Subsector.objects.get(pk=int(subsector)))


        return redirect('entries:entries', event)


class DeleteEntry(View):
    @method_decorator(login_required)
    def post(self, request, event):
        entry = Entry.objects.get(pk=request.POST["id"])
        entry.delete()
        return redirect('entries:entries', event=event)

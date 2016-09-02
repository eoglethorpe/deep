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
from . import export_xls, export_docx, export_fields

import os
import json


def get_entry_form_data(event):
    data = {}

    # Countries.
    data["countries"] = event.countries.all()
    # Sectors.
    data["sectors"] = Sector.objects.all()

    # Vulnerable groups.
    data["vulnerable_groups"] = VulnerableGroup.objects.all()
    # Specific needs groups.
    data["specific_needs_groups"] = SpecificNeedsGroup.objects.all()

    # Information Attributes
    data["attributes"] = {}
    attr_groups = InformationAttributeGroup.objects.all()
    for group in attr_groups:
        data["attributes"][group] = \
            InformationAttribute.objects.filter(group=group)
    data["reliabilities"] = AttributeData.RELIABILITIES
    data["severities"] = AttributeData.SEVERITIES

    # Affected Groups.
    data["affected_groups"] = AffectedGroup.objects.all()
    return data


class ExportView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "export"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()
        context.update(get_entry_form_data(context["event"]))
        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/export.html", context)


class ExportXls(View):
    @method_decorator(login_required)
    def get(self, request, event):
        response = HttpResponse(content = export_xls.export(), content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('xls')

        return response


class ExportDocx(View):
    @method_decorator(login_required)
    def get(self, request, event):
        order = request.GET.get("order").split(',')
        order_values = {
            "geoarea": "Map Selections",
            "affected": "Affected Groups",
            # "reliability": "Reliability",
            # "severity": "Severity",
            # "sector": "Sector",
        }
        ord = [order_values[a] for a in order if a in order_values]

        # ord = ["Map Selections", "Affected Groups", "Vulnerable Groups"]
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        response['Content-Disposition'] = 'attachment; filename = %s' % export_fields.get_file_name('doc')
        export_docx.export(ord).save(response)

        return response


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()
        context.update(get_entry_form_data(context["event"]))
        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, event, lead_id=None, id=None):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        UserProfile.set_last_event(request, context["event"])

        if id:
            entry = Entry.objects.get(pk=int(id))
            lead = entry.lead
        elif lead_id:
            entry = None
            lead = Lead.objects.get(pk=int(lead_id))
        else:
            raise Exception("Wrong view")

        context["lead"] = lead

        # Find simplified version of the lead content.
        # Make sure to catch any exception.

        try:
            if lead.lead_type == "URL":
                doc = WebDocument(lead.url)

                if doc.html:
                    context["lead_simplified"] = \
                        HtmlStripper(doc.html).simplify()
                elif doc.pdf:
                    context["lead_simplified"] = \
                        PdfStripper(doc.pdf).simplify()

            elif lead.lead_type == "MAN":
                context["lead_simplified"] = lead.description

            elif lead.lead_type == "ATT":
                attachment = lead.attachment
                name, extension = os.path.splitext(attachment.upload.name)
                if extension == ".pdf":
                    context["lead_simplified"] = \
                        PdfStripper(attachment.upload).simplify()
                elif extension in [".html", ".htm"]:
                    context["lead_simplified"] = \
                        HtmlStripper(attachment.upload.read()).simplify()
        except:
            print("Error while simplifying")

        if entry:
            context["entry"] = entry
            attr_data = AttributeData.objects.filter(entry=entry)
            temp = {}
            for ad in attr_data:
                if not ad.number:
                    ad.number = ""
                if not ad.reliability:
                    ad.reliability = "NOA"
                if not ad.severity:
                    ad.severity = "NOA"
                if ad.attribute.pk in temp:
                    temp[ad.attribute.pk]["data"].append(ad.excerpt)
                    temp[ad.attribute.pk]["number"].append(ad.number)
                    temp[ad.attribute.pk]["reliability"].append(ad.reliability)
                    temp[ad.attribute.pk]["severity"].append(ad.severity)
                else:
                    temp[ad.attribute.pk] = {}
                    temp[ad.attribute.pk]["data"] = [ad.excerpt]
                    temp[ad.attribute.pk]["number"] = [ad.number]
                    temp[ad.attribute.pk]["reliability"] = [ad.reliability]
                    temp[ad.attribute.pk]["severity"] = [ad.severity]

            context["attr_data"] = temp

        context.update(get_entry_form_data(context["event"]))

        if "prev_entry" in request.GET:
            context["prev_entry"] = Entry.objects.get(pk=request.GET["prev_entry"])
        return render(request, "entries/add-entry.html", context)

    @method_decorator(login_required)
    def post(self, request, event, lead_id=None, id=None):

        if id:
            entry = Entry.objects.get(id=id)
        else:
            entry = Entry()

        affected_groups = json.loads(request.POST["affected_groups"])
        map_data = json.loads(request.POST["map_data"])
        information_attributes = json.loads(
            request.POST["information_attributes"])
        vulnerable_groups = json.loads(
            request.POST["vulnerable_groups"])
        specific_needs_groups = json.loads(
            request.POST["specific_needs_groups"])

        if lead_id:
            entry.lead = Lead.objects.get(pk=lead_id)
        entry.created_by = request.user
        entry.save()

        # Save the affected groups.
        # ['All Population', 'Affected', 'Non Displaced', 'Refugees']
        for group in affected_groups:
            entry.affected_groups.add(AffectedGroup.objects.get(name=group))

        # Save the map data.
        # ['NP:0:Mid-Western Development Region', 'NP:1:Bheri', 'NP:2:Dang',
        #  'NP:2:Rukum']
        temp = entry.map_selections.all()
        entry.map_selections.clear()
        temp.delete()
        for area in map_data:
            m = area.split(':')
            admin_level = AdminLevel.objects.get(
                country=Country.objects.get(code=m[0]),
                level=int(m[1])+1
            )
            try:
                selection = AdminLevelSelection.objects.get(
                    admin_level=admin_level, name=m[2]
                )
            except:
                selection = AdminLevelSelection(admin_level=admin_level,
                                                name=m[2])
                selection.save()

            entry.map_selections.add(selection)

        # The vulnerable groups.
        temp = entry.vulnerable_groups.all()
        entry.vulnerable_groups.clear()
        temp.delete()
        for vg in vulnerable_groups:
            vulnerable_group = VulnerableGroup.objects.get(pk=int(vg))
            entry.vulnerable_groups.add(vulnerable_group)

        # The specific needs groups.
        temp = entry.specific_needs_groups.all()
        entry.specific_needs_groups.clear()
        temp.delete()
        for sg in specific_needs_groups:
            specific_group = SpecificNeedsGroup.objects.get(pk=int(sg))
            entry.specific_needs_groups.add(specific_group)

        #  [{'id': '7', 'data': [''], 'number': [''], 'reliability': ['NOA']},
        #   {'id': '8', 'data': ['Popula'], 'number': ['20'],
        #    'reliability': ['NOA']},
        #   {'id': '9', 'data': ['Demo'], 'number': [''],
        #    'reliability': ['NOA']},
        #   {'id': '1', 'data': [''], 'number': [''], 'reliability': ['NOA']},
        #   {'id': '2', 'data': [''], 'number': [''], 'reliability': ['NOA']},
        #   {'id': '3', 'data': [''], 'number': [''], 'reliability': ['NOA']},
        #   {'id': '4', 'data': ['Politics'], 'number': [''],
        #    'reliability': ['USU']},
        #    {'id': '5', 'data': [''], 'number': [''], 'reliability': ['NOA']},
        #    {'id': '6', 'data': [''], 'number': [''], 'reliability': ['NOA']}]

        AttributeData.objects.filter(entry=entry).delete()
        for attr in information_attributes:
            for i in range(len(attr['data'])):
                if attr['data'][i] == "":
                    continue
                attr_data = AttributeData()
                attr_data.entry = entry
                attr_data.attribute = InformationAttribute.objects.get(
                    pk=int(attr["id"]))
                attr_data.excerpt = attr["data"][i]
                if attr["number"][i] != '':
                    attr_data.number = int(attr["number"][i])
                if attr['reliability'][i] != '' and \
                        attr['reliability'][i] != 'NOA':
                    attr_data.reliability = attr['reliability'][i]
                if attr['severity'][i] != '' and \
                        attr['severity'][i] != 'NOA':
                    attr_data.severity = attr['severity'][i]
                attr_data.save()

        if request.POST["add_another"] == "1":
            return redirect(reverse("entries:add", args=[event, entry.lead.pk]) + "?prev_entry="+str(entry.pk))
        else:
            return redirect("entries:entries", event)


class DeleteEntry(View):
    @method_decorator(login_required)
    def post(self, request, event):
        entry = Entry.objects.get(pk=request.POST["id"])
        entry.delete()
        return redirect('entries:entries', event=event)

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse
from django.db.models import Q

from users.log import *
from users.models import *
from leads.models import *
from entries.models import *
from entries.strippers import *
# from . import export_xls, export_docx, export_fields
from entries.export_entries_docx import export_docx, export_docx_new_format
from entries.export_entries_pdf import export_pdf, export_pdf_new_format
from entries.export_entries_xls import export_xls
from report.export_xls import export_xls as export_xls_weekly
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

        UserProfile.set_last_event(request, context["event"])
        return render(request, "entries/export.html", context)


class ExportXls(View):
    def get(self, request, event):
        if request.GET.get('global') == '1':
            return export_xls('DEEP Entries-%s' % time.strftime("%Y-%m-%d"))
        else:
            return export_xls('DEEP Entries-%s' % time.strftime("%Y-%m-%d"),
                              int(event))


class ExportXlsWeekly(View):
    @method_decorator(login_required)
    def get(self, request, event):
        return export_xls_weekly('DEEP Entries-%s' % time.strftime("%Y-%m-%d"))


class ExportDocx(View):
    @method_decorator(login_required)
    def get(self, request, event):
        # order = request.GET.get("order").split(',')
        order = []
        format_name = ''
        file_format = 'pdf' if request.POST.get('is-pdf') else 'docx'

        content_type = 'application/pdf' if request.GET.get('is-pdf') else\
                       'application/vnd.openxmlformats'\
                       '-officedocument.wordprocessingml.document'

        response = HttpResponse(content_type=content_type)

        if 'export-geo-format' in request.GET:
            format_name = 'Export Geo'
            if request.GET.get('is-pdf'):
                response.write(
                    export_pdf(order, int(event), export_geo=True))
            else:
                export_docx(order, int(event), export_geo=True).save(response)
        if 'new-format' in request.GET:
            format_name = 'Briefing Note'
            if request.GET.get('is-pdf'):
                response.write(
                    export_pdf_new_format(order, int(event)))
            else:
                export_docx_new_format(order, int(event)).save(response)
        else:
            format_name = 'Generic Export'
            if request.GET.get('is-pdf'):
                response.write(
                    export_pdf(order, int(event)))
            else:
                export_docx(order, int(event)).save(response)

        response['Content-Disposition'] = 'attachment; filename = "DEEP'\
                                          'Entries(%s)-%s.%s"'\
                                          % (format_name,
                                             time.strftime("%Y-%m-%d"),
                                             file_format)

        return response

    @method_decorator(login_required)
    def post(self, request, event):
        # order = request.POST.get("order").split(',')
        order = []
        format_name = ''
        file_format = 'pdf' if request.POST.get('is-pdf') else 'docx'

        content_type = 'application/pdf' if request.POST.get('is-pdf') else\
                       'application/vnd.openxmlformats'\
                       '-officedocument.wordprocessingml.document'

        response = HttpResponse(content_type=content_type)

        if 'export-geo-format' in request.POST:
            format_name = 'Export Geo'
            if request.POST.get('is-pdf'):
                response.write(
                    export_pdf(order, int(event),
                                json.loads(request.POST["informations"]),
                                export_geo=True))
            else:
                export_docx(order, int(event),
                            json.loads(request.POST["informations"]),
                            export_geo=True).save(response)
        elif 'new-format' in request.POST:
            format_name = 'Briefing Note'
            if request.POST.get('is-pdf'):
                response.write(
                    export_pdf_new_format(
                        order, int(event),
                        json.loads(
                           request.POST["informations"])))
            else:
                export_docx_new_format(
                        order, int(event),
                        json.loads(
                           request.POST["informations"])).save(response)
        else:
            format_name = 'Generic Export'
            if request.POST.get('is-pdf'):
                response.write(
                    export_pdf(
                        order, int(event),
                        json.loads(request.POST["informations"])))
            else:
                export_docx(
                        order, int(event),
                        json.loads(request.POST["informations"]))\
                        .save(response)

        response['Content-Disposition'] = 'attachment; filename = "DEEP'\
                                          'Entries(%s)-%s.%s"'\
                                          % (format_name,
                                             time.strftime("%Y-%m-%d"),
                                             file_format)

        return response


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()

        context["users"] = User.objects.exclude(first_name="", last_name="")
        context["sources"] = []
        for lead in Lead.objects.filter(event=event):
            if lead.source_name and \
                    lead.source_name not in context["sources"] and \
                    Entry.objects.filter(lead=lead).count() > 0:
                context["sources"].append(lead.source_name)

        UserProfile.set_last_event(request, context["event"])

        if Event.objects.get(pk=event).entry_template:
            context["entry_template"] = Event.objects.get(pk=event).entry_template
            return render(request, "entries/template-entries.html", context)
        else:
            context["pillars"] = InformationPillar.objects.all()
            context["subpillars"] = InformationSubpillar.objects.all()
            context["sectors"] = Sector.objects.all()
            context["subsectors"] = Subsector.objects.all()
            context["vulnerable_groups"] = VulnerableGroup.objects.all()
            context["specific_needs_groups"] = SpecificNeedsGroup.objects.all()
            context["reliabilities"] = Reliability.objects.all().order_by('level')
            context["severities"] = Severity.objects.all().order_by('level')
            context["affected_groups"] = AffectedGroup.objects.all()

            return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, event, lead_id=None, id=None, template_id=None):
        refresh_pcodes()
        context = {}

        if template_id is None:
            if Event.objects.get(pk=event).entry_template:
                template_id = Event.objects.get(pk=event).entry_template.pk

        if not id:
            lead = Lead.objects.get(pk=lead_id)
            lead_entry = Entry.objects.filter(lead=lead)
            if lead_entry.count() > 0:
                return redirect('entries:edit', event, lead_entry[0].pk)
        else:
            entry = Entry.objects.get(pk=id)
            lead = entry.lead
            context["entry"] = entry
            if entry.template:
                template_id = entry.template.pk

        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["dummy_list"] = range(5)
        # context["all_events"] = Event.objects.all()

        context["lead"] = lead
        # get_simplified_lead(lead, context)
        try:
            simplified_lead = SimplifiedLead.objects.get(lead=lead)
            context["lead_simplified"] = simplified_lead.text
        except:
            get_simplified_lead(lead, context)
            if "lead_simplified" in context:
                SimplifiedLead(lead=lead, text=context["lead_simplified"]).save()

        if lead.lead_type == 'URL':
            context['lead_url'] = lead.url
        elif lead.lead_type == 'ATT':
            context['lead_url'] = request.build_absolute_uri(lead.attachment.upload.url)

        if context.get('lead_url'):
            if context['lead_url'].endswith('.pdf'):
                context["format"] = 'pdf'
            elif context['lead_url'].endswith('.docx'):
                context["format"] = 'docx'
            elif context['lead_url'].endswith('.pptx'):
                context["format"] = 'pptx'

        # With template
        if template_id:
            context["entry_template"] = EntryTemplate.objects.get(pk=template_id)
            UserProfile.set_last_event(request, context["event"])
            return render(request, "entries/add-template-entry.html", context)

        # Without template
        else:
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
    def post(self, request, event, lead_id=None, id=None, template_id=None):
        if template_id is None:
            if Event.objects.get(pk=event).entry_template:
                template_id = Event.objects.get(pk=event).entry_template.pk
        if not id:
            lead = Lead.objects.get(pk=lead_id)
            activity = CreationActivity()
        else:
            entry = Entry.objects.get(pk=id)
            lead = entry.lead
            activity = EditionActivity()
            if entry.template:
                template_id = entry.template.pk

        lead_entries = Entry.objects.filter(lead=lead)
        if lead_entries.count() > 0:
            entry = lead_entries[0]
            entry.entryinformation_set.all().delete()
        else:
            entry = Entry(lead=lead)
            entry.created_by = request.user

        if template_id:
            entry.template = EntryTemplate.objects.get(pk=template_id)

        entry.modified_by = request.user
        entry.save()

        activity.set_target(
            'entry', entry.pk, entry.lead.name,
            reverse('entries:edit', args=[entry.lead.event.pk, entry.pk])
        ).log_for(request.user, event=entry.lead.event)


        # With entry template
        if template_id:
            entries = json.loads(request.POST['entries'])
            for e in entries:
                information = EntryInformation(entry=entry)
                information.excerpt = e['excerpt']
                information.image = e['image']
                information.elements = json.dumps(e['elements'])
                information.save()

            return redirect('entries:entries', event)


        # Without template
        excerpts = json.loads(request.POST["excerpts"]);

        for excerpt in excerpts:
            information = EntryInformation(entry=entry)
            information.excerpt = excerpt["excerpt"]
            information.image = excerpt['image']

            information.bob = excerpt['bob']
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
                    level=int(m[1])
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

        if 'next_pending' in request.POST:
            next_pending = Lead.objects.filter(~Q(pk=lead.pk), event__pk=event, status='PEN').order_by('-created_at')
            if next_pending.count() > 0:
                return redirect('entries:add', event=event, lead_id=next_pending[0].pk)
        return redirect('entries:entries', event)


class DeleteEntry(View):
    @method_decorator(login_required)
    def post(self, request, event):
        entry = Entry.objects.get(pk=request.POST["id"])
        activity = DeletionActivity().set_target(
            'entry', entry.pk, entry.lead.name
        )
        event = entry.lead.event
        entry.delete()
        activity.log_for(request.user, event=event)
        return redirect('entries:entries', event=event)

from django.http import HttpResponse, JsonResponse, HttpResponseForbidden, \
    Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.views.generic import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse
from django.db.models import Q

from users.log import *
from users.models import *
from leads.models import *
from entries.models import *
from entries.strippers import *
from entries.entry_filters import filter_informations
from entries.export_entries_docx import export_docx, export_docx_new_format, export_analysis_docx
from entries.export_entries_pdf import export_pdf, export_analysis_pdf, export_pdf_new_format
from entries.export_entries_xls import export_xls, export_analysis_xls
from report.export_xls import export_xls as export_xls_weekly
from entries.refresh_pcodes import *
from leads.views import get_simplified_lead
from deep.filename_generator import generate_filename

import string
import json
import random
from datetime import datetime, timedelta
import requests


class ExportProgressView(View):
    def get(self, request):
        context = {'export_url': request.GET.get('url')}
        return render(request, 'entries/export-progress.html', context)


class ExportView(View):
    @method_decorator(login_required)
    def get(self, request, event):

        if Event.objects.filter(pk=event).count() == 0:
            raise Http404('Event does not exist')

        context = {}
        context["current_page"] = "export"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.get_events_for(request.user)
        if context['event'] not in context['all_events']:
            return HttpResponseForbidden()

        context["users"] = User.objects.exclude(first_name="", last_name="")
        context["lead_users"] = User.objects.filter(assigned_leads__event__pk=event)

        UserProfile.set_last_event(request, context["event"])

        if context["event"].entry_template:
            context["entry_template"] = context["event"].entry_template
            return render(request, 'entries/export-template.html', context)
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
            context["areas"] = AdminLevelSelection.objects.filter(entryinformation__entry__lead__event__pk=event).values_list('name', flat=True)
            return render(request, "entries/export.html", context)


class ExportXls(View):
    def get(self, request, event):
        if request.GET.get('global') == '1':
            return export_xls(generate_filename('Entries Global Export'))
        else:
            return export_xls(generate_filename('Entries Export'))


class ExportXlsWeekly(View):
    def get(self, request, event):
        return export_xls_weekly(generate_filename('Weekly Snapshot Export'))


@method_decorator(csrf_exempt, name='dispatch')
class ExportDoc(View):
    def get(self, request, event):
        # Get filtered informations from token
        informations = None
        request_data = None

        if request.GET.get('token'):
            try:
                export_token = ExportToken.objects.get(token=request.GET['token'])
                data = json.loads(export_token.data)
                informations = data['informations']
                request_data = data['post_data']
            except:
                pass

        if informations is None:
            informations = filter_informations(request.GET, Event.objects.get(pk=event)).values_list('id', flat=True)
        if request_data is None:
            request_data = dict(request.GET)

        # Excel export
        if request.GET.get('export-xls') == 'xls':
            if request.GET.get('export-format') == 'analysis-generic':
                return export_analysis_xls(generate_filename('Entries Export'), event, informations, request_data=request_data)
            else:
                return export_xls(generate_filename('Entries Export'), event, informations)

        # Docx and pdf export

        format_name = ''
        file_format = 'pdf' if (request.GET.get('export-pdf') == 'pdf') else 'docx'

        content_type = 'application/pdf' if (request.GET.get('export-pdf') == 'pdf') else\
                       'application/vnd.openxmlformats'\
                       '-officedocument.wordprocessingml.document'

        response = HttpResponse(content_type=content_type)

        if request.GET.get('export-format') == 'analysis-generic':
            format_name = 'Generic Export'
            if request.GET.get('export-pdf') == 'pdf':
                response.write(export_analysis_pdf(int(event), informations, data=request_data))
            else:
                export_analysis_docx(int(event), informations, data=request_data).save(response)

        elif request.GET.get('export-format') == 'geo':
            format_name = 'Geo Export'
            if request.GET.get('export-pdf') == 'pdf':
                response.write(export_pdf(int(event), informations, data=request_data, export_geo=True))
            else:
                export_docx(int(event), informations, data=request_data, export_geo=True).save(response)

        elif request.GET.get('export-format') == 'briefing':
            format_name = 'Briefing Note'
            if request.GET.get('export-pdf') == 'pdf':
                response.write(export_pdf_new_format(int(event), informations))
            else:
                export_docx_new_format(int(event), informations).save(response)
        else:
            format_name = 'Generic Export'
            if request.GET.get('export-pdf') == 'pdf':
                response.write(export_pdf(int(event), informations, data=request_data))
            else:
                export_docx(int(event), informations, data=request_data).save(response)

        response['Content-Disposition'] = 'attachment; filename = "{}.{}"'.format(
            generate_filename('Entries ' + format_name), file_format)

        return response

    def post(self, request, event):
        ExportToken.objects.filter(created_at__lt=(datetime.now() - timedelta(hours=1))).delete()

        uniqueToken = None
        while True:
            uniqueToken = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(20))
            if ExportToken.objects.filter(token=uniqueToken).count() == 0:
                break

        export_token = ExportToken(token=uniqueToken)
        export_token.data = json.dumps({
            'informations': list(filter_informations(
                request.POST, Event.objects.get(pk=event)).values_list('id', flat=True)),
            'post_data': dict(request.POST),
        })
        export_token.save()

        return JsonResponse({ 'token': export_token.token })


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):

        if int(event) != 0 and Event.objects.filter(pk=event).count() == 0:
            raise Http404('Event does not exist')

        context = {}
        context["current_page"] = "entries"

        context["all_events"] = Event.get_events_for(request.user)
        context["users"] = User.objects.exclude(first_name="", last_name="")

        if int(event) != 0:
            context["event"] = Event.objects.get(pk=event)
            if context['event'] not in context['all_events']:
                return HttpResponseForbidden()
            UserProfile.set_last_event(request, context["event"])

        if int(event) != 0 and context["event"].entry_template:
            context["entry_template"] = context["event"].entry_template
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

            context["sources"] = Lead.objects.filter(event__pk=event, entry__isnull=False)\
                    .values_list('source_name', flat=True)
            context["sources"] = list(set(context["sources"]))

            return render(request, "entries/entries.html", context)


class AddEntry(View):
    @method_decorator(login_required)
    def get(self, request, event, lead_id=None, id=None):

        if Event.objects.filter(pk=event).count() == 0:
            raise Http404('Event does not exist')
        if lead_id:
            if Lead.objects.filter(pk=lead_id).count() == 0:
                raise Http404('Lead does not exist')
        if id:
            if Entry.objects.filter(pk=id).count() == 0:
                raise Http404('Entry does not exist')

        refresh_pcodes()
        context = {}

        template_id = None
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
        if context['event'] not in Event.get_events_for(request.user):
            return HttpResponseForbidden()
        context["dummy_list"] = range(5)
        # context["all_events"] = Event.objects.all()

        context["lead"] = lead
        # get_simplified_lead(lead, context)
        try:
            simplified_lead = SimplifiedLead.objects.get(lead=lead)
            context["lead_simplified"] = simplified_lead.text
        except:
            get_simplified_lead(lead, context)
            if "lead_simplified" in context and context['lead_simplified']:
                try:
                    SimplifiedLead(lead=lead, text=context["lead_simplified"]).save()
                except:
                    pass

        if lead.lead_type == 'URL':
            context['lead_url'] = lead.url
        elif lead.lead_type == 'ATT' and Attachment.objects.filter(lead=lead).count() > 0:
            context['lead_url'] = request.build_absolute_uri(lead.attachment.upload.url)

        if context.get('lead_url'):
            context['format'] = context['lead_url'].rpartition('.')[-1]

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
        else:
            entry = Entry.objects.get(id=id)
            lead = entry.lead

        lead_entries = Entry.objects.filter(lead=lead)
        if lead_entries.count() > 0:
            entry = lead_entries[0]
            entry.entryinformation_set.all().delete()
            activity = EditionActivity()
        else:
            entry = Entry(lead=lead)
            entry.created_by = request.user
            activity = CreationActivity()

        if entry.template:
            template_id = entry.template.pk
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
                information.excerpt = e.get('excerpt')
                information.image = e.get('image')
                information.elements = json.dumps(e.get('elements'))
                information.save()

            if request.POST.get('ajax'):
                next_pending = Lead.objects.filter(
                    ~Q(pk=lead.pk), event__pk=event,
                    status='PEN',
                ).order_by('-created_at')

                next_url = None
                if next_pending.count() > 0:
                    next_url = reverse('entries:add', kwargs={
                        'event': event,
                        'lead_id': next_pending[0].pk,
                    })
                else:
                    next_url = reverse('entries:entries', args=[event])
                return JsonResponse({'success': True, 'next': next_url})
            return redirect('entries:entries', event)

        # Without template
        excerpts = json.loads(request.POST["excerpts"])

        for excerpt in excerpts:
            information = EntryInformation(entry=entry)
            information.excerpt = excerpt.get("excerpt")
            information.image = excerpt.get('image')

            information.bob = excerpt.get('bob')

            if excerpt.get('reliability'):
                information.reliability = Reliability.objects.get(pk=int(excerpt["reliability"]))

            if excerpt.get('severity'):
                information.severity = Severity.objects.get(pk=int(excerpt["severity"]))

            if excerpt.get("number"):
                information.number = int(excerpt["number"])

            if excerpt.get("date"):
                information.date = excerpt["date"]

            information.save()

            if excerpt.get('affected_groups'):
                for ag in excerpt["affected_groups"]:
                    information.affected_groups.add(AffectedGroup.objects.get(pk=int(ag)))
            if excerpt.get('vulnerable_groups'):
                for vg in excerpt["vulnerable_groups"]:
                    information.vulnerable_groups.add(VulnerableGroup.objects.get(pk=int(vg)))
            if excerpt.get('specific_needs_groups'):
                for sg in excerpt["specific_needs_groups"]:
                    information.specific_needs_groups.add(SpecificNeedsGroup.objects.get(pk=int(sg)))

            if excerpt.get('map_selections'):
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

            if excerpt.get('attributes'):
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

        if request.POST.get('ajax'):
            next_pending = Lead.objects.filter(
                ~Q(pk=lead.pk), event__pk=event,
                status='PEN',
            ).order_by('-created_at')

            next_url = None
            if next_pending.count() > 0:
                next_url = reverse('entries:add', kwargs={
                    'event': event,
                    'lead_id': next_pending[0].pk,
                })
            else:
                next_url = reverse('entries:entries', args=[event])

            return JsonResponse({'success': True,
                                 'next': next_url})
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
        return redirect('entries:entries', event=event.pk)


class WebsiteInfoView(View):
    def post(self, request):
        url = request.POST.get('url')
        # TODO: check using regex for valid url

        # TODO: Replace http with https and send both urls for client to decide
        # Also do the following with both http and https

        USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'  # noqa
        headers = {
            'User-Agent': USER_AGENT,
        }

        try:
            r = requests.head(
                url, headers=headers,
                timeout=15
            )
        except requests.exceptions.RequestException:
            return JsonResponse({
                'errorCode': 2,
                'error': 'Cannot fetch website for this url.',
            })

        return JsonResponse({
            'headers': dict(r.headers),
        })

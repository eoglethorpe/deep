from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from entries.models import *

from entries.strippers import *

import os


def get_entry_form_data():
    data = {}
    data["countries"] = Country.objects.all()
    data["sectors"] = Sector.objects.all()
    # data["vulnerable_groups"] = VulnerableGroup.objects.all()
    data["affected_groups"] = AffectedGroup.objects.all()
    data["crisis_drivers"] = CrisisDriver.objects.all()
    data["underlying_factors"] = UnderlyingFactor.objects.all()
    data["statuses"] = Entry.STATUSES
    data["problem_timelines"] = Entry.PROBLEM_TIMELIES
    data["severities"] = Entry.SEVERITIES
    data["reliabilities"] = Entry.RELIABILITIES
    return data


class EntriesView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        context["all_events"] = Event.objects.all()
        context.update(get_entry_form_data())
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
            context["entry_sectors"] = [s.pk for s in entry.sectors.all()]
            context["entry_underlying_factors"] = \
                [f.pk for f in entry.underlying_factors.all()]
            context["entry_crisis_drivers"] = \
                [c.pk for c in entry.crisis_drivers.all()]

            # vgds = {}
            # agds = {}
            # for vgd in entry.vulnerablegroupdata_set.all():
            #     vgds[vgd.vulnerable_group.pk] = vgd.known_cases
            # for agd in entry.affectedgroupdata_set.all():
            #     agds[agd.affected_group.pk] = agd.known_cases

            # context["vulnerable_group_data_set"] = vgds
            # context["affected_group_data_set"] = agds

        context.update(get_entry_form_data())
        return render(request, "entries/add-entry.html", context)

    @method_decorator(login_required)
    def post(self, request, event, lead_id=None, id=None):

        if id:
            entry = Entry.objects.get(id=id)
        else:
            entry = Entry()

        vulnerable_groups = []
        affected_groups = []

        for key in request.POST:
            if request.POST[key] != "":
                if key.startswith('add-vulnerable-group-'):
                    if not key.startswith('add-vulnerable-group-known-cases-'):
                        j = key[21:]
                        kc_key = 'add-vulnerable-group-known-cases-'+j
                        kc = request.POST[kc_key]
                        vulnerable_groups.append((request.POST[key], kc))

                elif key.startswith('add-affected-group-'):
                    if not key.startswith('add-affected-group-known-cases-'):
                        j = key[19:]
                        kc_key = 'add-affected-group-known-cases-'+j
                        kc = request.POST[kc_key]
                        affected_groups.append((request.POST[key], kc))

        if lead_id:
            entry.lead = Lead.objects.get(pk=int(lead_id))
        entry.excerpt = request.POST['excerpt']
        # TODO: entry.information_at
        entry.country = Country.objects.get(pk=request.POST['country'])
        entry.map_data = request.POST['map-data']
        entry.status = request.POST['status']
        entry.problem_timeline = request.POST['problem-timeline']
        entry.severity = request.POST['severity']
        entry.reliability = request.POST['reliability']
        entry.created_by = request.user
        entry.save()

        entry.sectors.clear()
        for s in request.POST.getlist('sector'):
            entry.sectors.add(Sector.objects.get(name=s))

        entry.underlying_factors.clear()
        for uf in request.POST.getlist('underlying-factor'):
            entry.underlying_factors.add(UnderlyingFactor.objects.get(name=uf))

        entry.crisis_drivers.clear()
        for cd in request.POST.getlist('crisis-driver'):
            entry.crisis_drivers.add(CrisisDriver.objects.get(name=cd))

        # VulnerableGroupData.objects.filter(entry__pk=entry.pk).delete()
        # for vg in vulnerable_groups:
        #     vgd = VulnerableGroupData()
        #     vgd.entry = entry
        #     vgd.vulnerable_group = VulnerableGroup.objects.get(pk=vg[0])
        #     if vg[1] == "":
        #         vgd.known_cases = None
        #     else:
        #         vgd.known_cases = int(vg[1])
        #     vgd.save()

        # AffectedGroupData.objects.filter(entry__pk=entry.pk).delete()
        # for ag in affected_groups:
        #     agd = AffectedGroupData()
        #     agd.entry = entry
        #     agd.affected_group = AffectedGroup.objects.get(pk=ag[0])
        #     if ag[1] == "":
        #         agd.known_cases = None
        #     else:
        #         agd.known_cases = int(ag[1])
        #     agd.save()

        return redirect("entries:entries", event)

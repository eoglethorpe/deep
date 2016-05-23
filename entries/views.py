from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
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
    data["vulnerable_groups"] = VulnerableGroup.objects.all()
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
    def get(self, request, event, lead_id):
        context = {}
        context["current_page"] = "entries"
        context["event"] = Event.objects.get(pk=event)
        UserProfile.set_last_event(request, context["event"])

        context["lead"] = Lead.objects.get(pk=int(lead_id))
        lead = context["lead"]

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
        except:
            pass

        # TODO: ATTACHMENT LEAD: check if is pdf and simplify if so.

        context.update(get_entry_form_data())
        return render(request, "entries/add-entry.html", context)

    @method_decorator(login_required)
    def post(self, request, event, lead_id):
        entry = Entry()

        entry.lead = Lead.objects.get(pk=int(lead_id))
        entry.excerpt = request.POST['excerpt']
        # TODO: entry.information_at
        # entry.country = request.POST['country']
        entry.map_data = request.POST['map-data']
        entry.status = request.POST['status']
        entry.problem_timeline = request.POST['problem-timeline']
        entry.severity = request.POST['severity']
        entry.reliability = request.POST['reliability']
        entry.created_by = request.user
        entry.save()

        for s in request.POST.getlist('sector'):
            entry.sectors.add(Sector.objects.get(name=s))

        for uf in request.POST.getlist('underlying-factor'):
            entry.underlying_factors.add(UnderlyingFactor.objects.get(name=uf))

        for cd in request.POST.getlist('crisis-driver'):
            entry.crisis_drivers.add(CrisisDriver.objects.get(name=cd))

        # TODO: Vulenrable Group and Affected Group data.

        return redirect("entries:entries", event)

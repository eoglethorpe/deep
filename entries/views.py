from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from entries.models import *

from entries.strippers import *


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

        # TODO: ATTACHMENT LEAD: check if is pdf and simplify if so.

        context.update(get_entry_form_data())
        return render(request, "entries/add-entry.html", context)

    @method_decorator(login_required)
    def post(self, request, event, lead_id):
        return redirect("entries:add", event, lead_id)

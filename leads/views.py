from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from datetime import datetime

from users.models import *
from leads.models import *


def get_lead_form_data():
    """ Get data required to construct "Add Lead" form.
    """

    data = {}
    data["sources"] = Source.objects.all()
    data["confidentialities"] = Lead.CONFIDENTIALITIES
    data["statuses"] = Lead.STATUSES
    data["users"] = User.objects.exclude(first_name="", last_name="")
    return data


class LeadsView(View):
    @method_decorator(login_required)
    def get(self, request, event):
        context = {}
        context["current_page"] = "leads"
        context["event"] = Event.objects.get(pk=event)
        UserProfile.set_last_event(request, context["event"])
        context["all_events"] = Event.objects.all()
        return render(request, "leads/leads.html", context)


class AddLead(View):
    @method_decorator(login_required)
    def get(self, request, event, id=None):
        context = {}
        context["current_page"] = "leads"
        context["event"] = Event.objects.get(pk=event)
        UserProfile.set_last_event(request, context["event"])
        if not id:
            context["all_events"] = Event.objects.all()
        if id:
            context["lead"] = Lead.objects.get(pk=id)
        context.update(get_lead_form_data())
        return render(request, "leads/add-lead.html", context)

    @method_decorator(login_required)
    def post(self, request, event, id=None):

        error = ""

        # Get editing lead or create new lead.
        if id:
            lead = Lead.objects.get(pk=id)
        else:
            lead = Lead()

        lead.name = request.POST["name"]
        lead.event = Event.objects.get(pk=event)

        if "source" in request.POST and request.POST["source"] != "":
            lead.source = Source.objects.get(pk=request.POST["source"])
        else:
            lead.source = None

        lead.confidentiality = request.POST["confidentiality"]

        if "assigned-to" in request.POST and \
                request.POST["assigned-to"] != "":
            lead.assigned_to = User.objects.get(pk=request.POST["assigned-to"])
        else:
            lead.assigned_to = None

        if "publish-date" in request.POST and \
                request.POST["publish-date"] != "":
            lead.published_at = request.POST["publish-date"]
        else:
            lead.published_at = None

        lead.created_by = request.user

        if "lead-type" in request.POST and \
                request.POST["lead-type"] == "manual":
            lead.description = request.POST["description"]
            lead.lead_type = Lead.MANUAL_LEAD

        # TODO: Remove not condition.
        # Currently for the chrome plugin to work, the default type
        # when not provided is website.
        if "lead-type" not in request.POST or \
                request.POST["lead-type"] == "website":
            lead.url = request.POST["url"]
            lead.website = request.POST["website"]
            lead.lead_type = Lead.URL_LEAD

        if "lead-type" in request.POST and \
                request.POST["lead-type"] == "manual":
            lead.description = request.POST["description"]
            lead.lead_type = Lead.MANUAL_LEAD

        if "lead-type" in request.POST and \
                request.POST["lead-type"] == "attachment":
            lead.lead_type = Lead.ATTACHMENT_LEAD

        if "lead-type" in request.POST and \
                request.POST["lead-type"] == "survey-of-surveys":
            pass

        lead.save()

        if lead.lead_type == Lead.ATTACHMENT_LEAD:
            for file in request.FILES:
                Attachment.objects.filter(lead__pk=lead.pk).delete()
                attachment = Attachment()
                attachment.lead = lead
                attachment.upload = request.FILES[file]
                attachment.save()
                break

        if error != "":
            context = {}
            context["current_page"] = "leads"
            context["event"] = Event.objects.get(pk=event)
            UserProfile.set_last_event(request, context["event"])
            context["all_events"] = Event.objects.all()
            context["error"] = error
            return render(request, "leads/add-lead.html",
                          context)

        return redirect("leads:leads", event=event)


class MarkProcessed(View):
    @method_decorator(login_required)
    def post(self, request, event):
        lead = Lead.objects.get(pk=request.POST["id"])
        lead.status = Lead.PROCESSED
        lead.save()
        return redirect('leads:leads', event=event)


class DeleteLead(View):
    @method_decorator(login_required)
    def post(self, request, event):
        lead = Lead.objects.get(pk=request.POST["id"])
        lead.status = Lead.DELETED
        lead.save()
        return redirect('leads:leads', event=event)

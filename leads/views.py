from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from datetime import datetime

from leads.models import *


def get_lead_form_data():
    """ Get data required to construct "Add Lead" form.
    """

    data = {}
    data["sources"] = Source.objects.all()
    data["content_formats"] = ContentFormat.objects.all()
    data["confidentialities"] = Lead.CONFIDENTIALITIES
    data["statuses"] = Lead.STATUSES
    data["users"] = User.objects.exclude(first_name="", last_name="")
    return data


class LeadsView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["current_page"] = "leads"
        return render(request, "leads/leads.html", context)


class AddManual(View):
    @method_decorator(login_required)
    def get(self, request, id=None):
        context = {}
        context["current_page"] = "leads"
        if id:
            context["lead"] = Lead.objects.get(pk=id)
        context.update(get_lead_form_data())
        return render(request, "leads/add-manual.html", context)

    @method_decorator(login_required)
    def post(self, request, id=None):

        error = ""

        # Get editing lead or create new lead.
        if id:
            lead = Lead.objects.get(pk=id)
        else:
            lead = Lead()
        lead.name = request.POST["name"]

        if request.POST["source"] != "":
            lead.source = Source.objects.get(pk=request.POST["source"])
        else:
            lead.source = None

        if request.POST["content-format"] != "":
            lead.content_format = request.POST["content-format"]
        else:
            lead.content_format = None

        lead.confidentiality = request.POST["confidentiality"]

        if request.POST["assigned-to"] != "":
            lead.assigned_to = User.objects.get(pk=request.POST["assigned-to"])
        else:
            lead.assigned_to = None

        if request.POST["publish-date"] != "":
            lead.published_at = request.POST["publish-date"]
        else:
            lead.published_at = None

        lead.created_by = request.user
        lead.description = request.POST["description"]
        lead.lead_type = Lead.MANUAL_LEAD
        lead.save()

        for file in request.FILES:
            attachment = Attachment()
            attachment.lead = lead
            attachment.upload = request.FILES[file]
            attachment.save()

        if error != "":
            return render(request, "leads/add-manual.html",
                          {"error": error})

        # if request.POST["post"] == "save-and-another":
        #     return redirect("leads:add-manual")
        # else:
        return redirect("leads:leads")

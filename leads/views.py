from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from django.forms import inlineformset_factory

from leads.models import *


""" Get data required to construct "Add Lead" form.
"""
def get_lead_form_data():
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
    def get(self, request):
        context = {}
        context["current_page"] = "leads"
        context.update(get_lead_form_data())
        return render(request, "leads/add-manual.html", context)

    @method_decorator(login_required)
    def post(self, request):
        return redirect("leads:add-manual")

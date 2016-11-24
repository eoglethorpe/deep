from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse

from leads.models import *
from entries.models import *
from report.models import *


class CrisisPanelView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["current_page"] = "crisis-panel"
        context["events"] = Event.objects.all()

        context["countries"] = Country.objects.all()
        context["disaster_types"] = DisasterType.objects.all()
        context["users"] = User.objects.all()

        if "selected" in request.GET:
            context["selected_event"] = int(request.GET["selected"]) 

        return render(request, "custom_admin/crisis-panel.html", context)

    @method_decorator(login_required)
    def post(self, request):

        response = redirect('custom_admin:crisis_panel')
        pk = request.POST["crisis-pk"]

        if "save" in request.POST:
            if pk == "new":
                event = Event()
            else:
                event = Event.objects.get(pk=int(pk))

            event.name = request.POST["crisis-name"]
            if request.POST["disaster-type"] and request.POST["disaster-type"] != "":
                event.disaster_type = DisasterType.objects.get(pk=int(request.POST["disaster-type"]))
            else:
                event.disaster_type = None
            
            if request.POST["crisis-start-date"] and request.POST["crisis-start-date"] != "":
                event.start_date = request.POST["crisis-start-date"]
            else:
                event.start_date = None
            
            if request.POST["crisis-end-date"] and request.POST["crisis-end-date"] != "":
                event.end_date = request.POST["crisis-end-date"]
            else:
                event.end_date = None

            if request.POST["assigned-to"] and request.POST["assigned-to"] != "":
                event.assigned_to = User.objects.get(pk=int(request.POST["assigned-to"]))
            else:
                event.assigned_to = None

            event.save()

            event.countries.clear()
            if "countries" in request.POST and request.POST["countries"]:
                for country in request.POST.getlist("countries"):
                    event.countries.add(Country.objects.get(pk=country))

            response["Location"] += "?selected="+str(event.pk)
        
        elif "delete" in request.POST:
            if pk != "new":
                Event.objects.get(pk=int(pk)).delete()

        return response
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
        context["events"] = Event.objects.all().order_by('name')

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

            if request.POST["crisis-status"] and request.POST["crisis-status"] != "":
                event.status = int(request.POST["crisis-status"])

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

            if request.POST["glide-number"] and request.POST["glide-number"] != "":
                event.glide_number = request.POST["glide-number"]
            else:
                event.glide_number = None

            if request.POST["spillover"] and request.POST["spillover"] != "":
                event.spill_over = Event.objects.get(pk=int(request.POST["spillover"]))
            else:
                event.spill_over = None

            event.save()

            event.assignee.clear()
            if "assigned-to" in request.POST and request.POST["assigned-to"]:
                for assigned_to in request.POST.getlist("assigned-to"):
                    event.assignee.add(User.objects.get(pk=int(assigned_to)))

            event.countries.clear()
            if "countries" in request.POST and request.POST["countries"]:
                for country in request.POST.getlist("countries"):
                    event.countries.add(Country.objects.get(pk=country))

            response["Location"] += "?selected="+str(event.pk)

        elif "delete" in request.POST:
            if pk != "new":
                Event.objects.get(pk=int(pk)).delete()

        return response


class CountryManagementView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["current_page"] = "country-management"
        context["events"] = Event.objects.all()
        context["countries"] = Country.objects.all()

        if "selected" in request.GET:
            context["selected_country"] = request.GET["selected"]

        return render(request, "custom_admin/country-management.html", context)

    @method_decorator(login_required)
    def post(self, request):
        response = redirect('custom_admin:country_management')

        if 'save' in request.POST:
            code = request.POST['country-code']
            try:
                country = Country.objects.get(code=code)
            except:
                country = Country(code=code)

            country.name = request.POST['country-name']

            # Key figures
            country.hdi_index = request.POST['hdi-index']
            country.hdi_rank= request.POST['hdi-rank']
            country.u5m = request.POST['u5m']

            country.number_of_refugees = request.POST['number-of-refugees']
            country.number_of_idps = request.POST['number-of-idps']
            country.number_of_returned_refugees = request.POST['number-of-returned-refugees']

            country.inform_score = request.POST['inform-score']
            country.inform_risk_index = request.POST['inform-risk-index']
            country.inform_hazard_and_exposure= request.POST['inform-hazard-and-exposure']
            country.inform_vulnerability = request.POST['inform-vulnerability']
            country.inform_lack_of_coping_capacity = request.POST['inform-lack-of-coping-capacity']

            country.total_population = request.POST['total-population']
            country.population_soure = request.POST['population-source']

            country.save()

            # Admin areas
            admin_level_pks = request.POST.getlist('admin-level-pk')
            admin_levels = request.POST.getlist('admin-level')
            admin_level_names = request.POST.getlist('admin-level-name')
            property_names = request.POST.getlist('property-name')
            property_pcodes = request.POST.getlist('property-pcode')
            geojsons = request.FILES.getlist('geojson')
            geojsons_selected = request.POST.getlist('geojson-selected')

            # Deletion are checkboxes and need to be handled differently
            # See html comment for more info
            temp = request.POST.getlist('delete-admin-level')
            delete_admin_levels = []
            t = 0
            while t < len(temp):
                if temp[t] == '0':
                    delete_admin_levels.append(False)
                else:
                    t += 1
                    delete_admin_levels.append(True)
                t += 1

            # Post each admin level
            geojson_file = 0
            for i, pk in enumerate(admin_level_pks):

                to_delete = delete_admin_levels[i] or admin_levels[i] == '' \
                    or admin_level_names[i] == '' or property_names[i] == ''

                if pk == "new":
                    admin_level = AdminLevel()
                    if to_delete:
                        continue
                else:
                    admin_level = AdminLevel.objects.get(pk=int(pk))
                    if to_delete:
                        admin_level.delete()
                        continue

                admin_level.country = country
                admin_level.level = int(admin_levels[i])
                admin_level.name = admin_level_names[i]
                admin_level.property_name = property_names[i]
                admin_level.property_pcode = property_pcodes[i]

                if geojsons_selected[i] == 'true':
                    admin_level.geojson = geojsons[geojson_file]
                    geojson_file += 1
                admin_level.save()


            response["Location"] += "?selected="+str(country.pk)

        elif 'delete' in request.POST:
            try:
                country = Country.objects.get(code=request.POST['country-code']).delete()
            except:
                pass

        return response

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
from usergroup.models import *
from users.log import *


class CrisisPanelView(View):
    @method_decorator(login_required)
    def get(self, request):
        context = {}
        context["current_page"] = "crisis-panel"

        # Either you are a super admin and can edit all crises
        # Or you are admin of this project

        if request.user.is_superuser:
            context["events"] = Event.objects.all().order_by('name')
        else:
            context["events"] = Event.objects.filter(admins__pk=request.user.pk).order_by('name')

        context["usergroups"] = UserGroup.objects.all()
        context["countries"] = Country.objects.all()
        context["disaster_types"] = DisasterType.objects.all()
        context["users"] = User.objects.all()

        if "selected" in request.GET:
            context["selected_event"] = int(request.GET["selected"])

        if "selected_group" in request.GET:
            context["selected_group"] = int(request.GET["selected_group"])

        return render(request, "custom_admin/crisis-panel.html", context)

    @method_decorator(login_required)
    def post(self, request):

        response = redirect('custom_admin:crisis_panel')
        pk = request.POST["crisis-pk"]

        if "save" in request.POST:
            if pk == "new":
                event = Event()
                activity = CreationActivity()
            else:
                event = Event.objects.get(pk=int(pk))
                activity = EditionActivity()

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

            activity.set_target(
                'project', event.pk, event.name,
                reverse('custom_admin:crisis_panel') + '?selected=' + str(event.pk)
            ).log_for(request.user, event=event)

            event.assignee.clear()
            if "assigned-to" in request.POST and request.POST["assigned-to"]:
                for assigned_to in request.POST.getlist("assigned-to"):
                    event.assignee.add(User.objects.get(pk=int(assigned_to)))

            event.admins.clear()
            if "admins" in request.POST and request.POST["admins"]:
                for admin in request.POST.getlist("admins"):
                    event.admins.add(User.objects.get(pk=int(admin)))

            event.countries.clear()
            if "countries" in request.POST and request.POST["countries"]:
                for country in request.POST.getlist("countries"):
                    event.countries.add(Country.objects.get(pk=country))

            prev_groups = event.usergroup_set.all()
            for ug in prev_groups:
                ug.projects.remove(event)

            new_groups = []
            if "user-groups" in request.POST and request.POST["user-groups"]:
                for pk in request.POST.getlist("user-groups"):
                    usergroup = UserGroup.objects.get(pk=pk)
                    usergroup.projects.add(event)

                    new_groups.append(usergroup)
                    if usergroup not in prev_groups:
                        AdditionActivity().set_target(
                            'project', event.pk, event.name,
                            reverse('custom_admin:crisis_panel') + '?selected=' + str(event.pk)
                        ).log_for(request.user, event=event, group=usergroup)

            for ug in prev_groups:
                if ug not in new_groups:
                    RemovalActivity().set_target(
                        'project', event.pk, event.name,
                        reverse('custom_admin:crisis_panel') + '?selected=' + str(event.pk)
                    ).log_for(request.user, event=event, group=ug)

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

            # Country Region Data
            region_data = {
                'WB Region': request.POST.get('country-wb-region'),
                'WB IncomeGroup': request.POST.get('country-wb-income-group'),
                'UN-OCHA Region': request.POST.get('country-ocha-region'),
                'EC-ECHO Region': request.POST.get('country-echo-region'),
                'UN Geographical Region':
                    request.POST.get('country-un-geographical-region'),
                'UN Geographical Sub-Region':
                    request.POST.get('country-un-geographical-sub-region'),
            }

            # Key figures
            key_figures = {
                'hdi_index': request.POST['hdi-index'],
                'hdi_rank': request.POST['hdi-rank'],
                'u5m': request.POST['u5m'],

                'number_of_refugees': request.POST['number-of-refugees'],
                'number_of_idps': request.POST['number-of-idps'],
                'number_of_returned_refugees':
                    request.POST['number-of-returned-refugees'],

                'inform_score': request.POST['inform-score'],
                'inform_risk_index': request.POST['inform-risk-index'],
                'inform_hazard_and_exposure':
                    request.POST['inform-hazard-and-exposure'],
                'inform_vulnerability':
                    request.POST['inform-vulnerability'],
                'inform_lack_of_coping_capacity':
                    request.POST['inform-lack-of-coping-capacity'],

                'total_population': request.POST['total-population'],
                'population_source': request.POST['population-source'],
            }

            country.regions = json.dumps(region_data)
            country.key_figures = json.dumps(key_figures)
            country.media_sources = request.POST['media-sources']

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

from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.db.models import Q
from django.contrib.auth.models import User

from leads.models import \
    Event, \
    Country
from entries.models import EntryTemplate, AdminLevel
from usergroup.models import UserGroup
from report.models import DisasterType
from users.log import \
    CreationActivity, \
    DeletionActivity, \
    EditionActivity, \
    AdditionActivity, \
    RemovalActivity

import json


class ProjectDetailsView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        project = Event.objects.get(pk=project_id)

        context = {}
        context["current_page"] = "project-details"
        context["project_id"] = project_id

        context["projects"] = Event.objects.filter(
            Q(admins=request.user) | Q(usergroup__admins=request.user)
        ).distinct().order_by('name')

        context["usergroups"] = UserGroup.objects.filter(
            Q(admins=request.user) | Q(projects=project)
        ).distinct().order_by('name')

        context["countries"] = Country.objects.filter(
            Q(reference_country=None) | Q(event__pk=project_id)
        )

        context["users"] = User.objects.all()
        context["project"] = project
        context['disaster_types'] = DisasterType.objects.all()

        if "selected_group" in request.GET:
            context["selected_group"] = int(request.GET["selected_group"])

        return render(request, "project/project-details.html", context)

    @method_decorator(login_required)
    def post(self, request, project_id):

        if 'add-new' in request.POST:
            project = Event()
        else:
            project = Event.objects.get(pk=project_id)

        if 'add-new' in request.POST:
            project.name = request.POST['name']
            project.save()
            project.admins.add(request.user)

            if 'group-id' in request.POST:
                UserGroup.objects.get(pk=request.POST['group-id'])\
                    .projects.add(project)

            CreationActivity().set_target(
                'project', project.pk, project.name,
                reverse('project:project_details', args=[project.pk])
            ).log_for(request.user, event=project)

            return redirect('project:project_details', project.pk)

        elif "save" in request.POST or 'save-and-proceed' in request.POST:
            project.name = request.POST["project-name"]
            project.description = request.POST["project-description"]

            if request.POST.get('project-start-date') != '':
                project.start_date = request.POST["project-start-date"]
            else:
                project.start_date = None

            if request.POST.get('project-end-date') != '':
                project.end_date = request.POST["project-end-date"]
            else:
                project.end_date = None

            if project.is_acaps():
                if request.POST.get('project-status') != '':
                    project.status = int(request.POST['project-status'])

                if request.POST.get('disaster-type') != '':
                    project.disaster_type = \
                        DisasterType.objects.get(
                            pk=int(request.POST['disaster-type']))
                else:
                    project.disaster_type = None

                if request.POST.get('glide-number') != '':
                    project.glide_number = request.POST['glide-number']
                else:
                    project.glide_number = None

                if request.POST.get('spillover') != '':
                    project.spill_over = \
                        Event.objects.get(pk=int(request.POST['spillover']))
                else:
                    project.spill_over = None

            project.save()

            if project.admins.count() == 0:
                project.admins.add(request.user)

            EditionActivity().set_target(
                'project', project.pk, project.name,
                reverse('project:project_details', args=[project.pk])
            ).log_for(request.user, event=project)

            project.admins.clear()
            if request.POST.get("admins"):
                for admin in request.POST.getlist("admins"):
                    project.admins.add(User.objects.get(pk=int(admin)))

            project.members.clear()
            if request.POST.get("members"):
                for member in request.POST.getlist("members"):
                    project.members.add(User.objects.get(pk=int(member)))

            project.countries.clear()
            if request.POST.get("countries"):
                for country in request.POST.getlist("countries"):
                    project.countries.add(Country.objects.get(pk=country))

            prev_groups = project.usergroup_set.all()
            for ug in prev_groups:
                ug.projects.remove(project)

            new_groups = []
            if request.POST.get("user-groups"):
                for pk in request.POST.getlist("user-groups"):
                    usergroup = UserGroup.objects.get(pk=pk)
                    usergroup.projects.add(project)

                    new_groups.append(usergroup)
                    if usergroup not in prev_groups:
                        AdditionActivity().set_target(
                            'project', project.pk, project.name,
                            reverse('project:project_details',
                                    args=[project.pk])
                        ).log_for(request.user, event=project, group=usergroup)

            for ug in prev_groups:
                if ug not in new_groups:
                    RemovalActivity().set_target(
                        'project', project.pk, project.name,
                        reverse('project:project_details', args=[project.pk])
                    ).log_for(request.user, event=project, group=ug)

            Country.objects.filter(event=None)\
                .exclude(reference_country=None).delete()

            if 'save-and-proceed' in request.POST:
                return redirect('project:geo_area', project.pk)
            else:
                return redirect('project:project_details', project.pk)

        elif "delete" in request.POST:
            activity = DeletionActivity().set_target(
                'project', project.pk, project.name)
            project.delete()
            activity.log_for(request.user)

            Country.objects.filter(event=None)\
                .exclude(reference_country=None).delete()
            EntryTemplate.objects.filter(usergroup=None, event=None).delete()
            return redirect('login')


class GeoAreaView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "geo-area"
        context["project"] = Event.objects.get(pk=project_id)
        return render(request, "project/geo-area.html", context)

    @method_decorator(login_required)
    def post(self, request, project_id):
        project = Event.objects.get(pk=project_id)

        if 'save' in request.POST or 'save-and-proceed' in request.POST:
            if request.POST.get('modified') == '1':

                code = request.POST.get('actual-code')
                reference_code = request.POST.get('country-code')
                reference_country = Country.objects.get(code=reference_code)

                admin_pk_map = {}

                if code == reference_code:
                    # Cloning the country
                    code = Country.get_unique_code()
                    country = Country(code=code)
                    country.name = reference_country.name
                    country.reference_country = reference_country
                    country.save()

                    for admin_level in reference_country.adminlevel_set.all():
                        new_level = AdminLevel()
                        new_level.level = admin_level.level
                        new_level.country = country
                        new_level.name = admin_level.name
                        new_level.property_name = admin_level.property_name
                        new_level.property_pcode = admin_level.property_pcode

                        if admin_level.geojson:
                            geojson = ContentFile(admin_level.geojson.read())
                            geojson.name = admin_level.geojson.name
                            new_level.geojson = geojson
                        new_level.save()
                        admin_pk_map[int(admin_level.pk)] = new_level.pk
                else:
                    country = Country.objects.get(code=code)

                country.name = request.POST['country-name']

                # Country Region Data
                region_data = {
                    'WB Region':
                        request.POST.get('country-wb-region'),
                    'WB IncomeGroup':
                        request.POST.get('country-wb-income-group'),
                    'UN-OCHA Region':
                        request.POST.get('country-ocha-region'),
                    'EC-ECHO Region':
                        request.POST.get('country-echo-region'),
                    'UN Geographical Region':
                        request.POST.get('country-un-geographical-region'),
                    'UN Geographical Sub-Region':
                        request.POST.get('country-un-geographical-sub-region'),
                }
                country.regions = json.dumps(region_data)
                country.save()

                # Admin areas
                admin_level_pks = request.POST.getlist('admin-level-pk')
                temp = []
                for pk in admin_level_pks:
                    if int(pk) in admin_pk_map:
                        temp.append(admin_pk_map[int(pk)])
                    else:
                        temp.append(pk)
                admin_level_pks = temp

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

                    to_delete = delete_admin_levels[i] \
                        or admin_levels[i] == '' \
                        or admin_level_names[i] == '' \
                        or property_names[i] == ''

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

                if reference_country in project.countries.all():
                    project.countries.remove(reference_country)
                if country not in project.countries.all():
                    project.countries.add(country)

        if 'save-and-proceed' in request.POST:
            return redirect('project:analysis_framework', project_id)
        return redirect('project:geo_area', project_id)


class AnalysisFrameworkView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "analysis-framework"

        project = Event.objects.get(pk=project_id)
        if not project.entry_template:
            new_template = EntryTemplate(name=project.name)
            new_template.created_by = request.user
            new_template.save()

            project.entry_template = new_template
            project.save()

        context["project"] = project
        context["projects"] = Event.objects.filter(admins__pk=request.user.pk)\
            .exclude(entry_template=None).order_by('name')

        return render(request, "project/analysis-framework.html", context)

    @method_decorator(login_required)
    def post(self, request, project_id):
        project = Event.objects.get(pk=project_id)
        if 'save-and-finish' in request.POST:
            entry_template = project.entry_template

            entry_template.name = request.POST.get('template-name')
            clone_from = request.POST.get('clone-from')
            if clone_from != '':
                entry_template.elements = Event.objects.get(pk=clone_from)\
                    .entry_template.elements
            entry_template.save()

        return redirect('dashboard', project_id)

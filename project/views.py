from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

from leads.models import *
from usergroup.models import *
from users.log import *


class ProjectDetailsView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["current_page"] = "project-details"
        context["project_id"] = project_id

        # Either you are a super admin and can edit all crises
        # Or you are admin of this project

        if request.user.is_superuser:
            context["projects"] = Event.objects.all().order_by('name')
            context["usergroups"] = UserGroup.objects.all()
        else:
            context["projects"] = Event.objects.filter(admins__pk=request.user.pk).order_by('name')
            context["usergroups"] = UserGroup.objects.filter(admins__pk=request.user.pk).order_by('name')

        context["countries"] = Country.objects.all()
        context["users"] = User.objects.all()
        context["project"] = Event.objects.get(pk=project_id)

        if "selected_group" in request.GET:
            context["selected_group"] = int(request.GET["selected_group"])

        return render(request, "project/project-details.html", context)

    @method_decorator(login_required)
    def post(self, request, project_id):
        project = Event.objects.get(pk=project_id)

        if 'add-new' in request.POST:
            project = Event()
            project.name = request.POST['name']
            project.save()
            project.admins.add(request.user)

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
                            reverse('project:project_details', args=[project.pk])
                        ).log_for(request.user, event=project, group=usergroup)

            for ug in prev_groups:
                if ug not in new_groups:
                    RemovalActivity().set_target(
                        'project', project.pk, project.name,
                        reverse('project:project_details', args=[project.pk])
                    ).log_for(request.user, event=project, group=ug)

            if 'save-and-proceed' in request.POST:
                return redirect('project:geo_area', project.pk)
            else:
                return redirect('project:project_details', project.pk)

        elif "delete" in request.POST:
            activity = DeletionActivity().set_target('project', project.pk, project.name)
            project.delete()
            activity.log_for(request.user)
            return redirect('login')

class GeoAreaView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "geo-area"
        context["project"] = Event.objects.get(pk=project_id)
        return render(request, "project/geo-area.html", context)

class AnalysisFrameworkView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "analysis-framework"

        return render(request, "project/analysis-framework.html", context)

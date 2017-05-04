from django.shortcuts import render
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

from leads.models import *


class ProjectDetailsView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["current_page"] = "project-details"
        context["project_id"] = project_id

        # Either you are a super admin and can edit all crises
        # Or you are admin of this project

        if request.user.is_superuser:
            context["events"] = Event.objects.all().order_by('name')
            # context["usergroups"] = UserGroup.objects.all()
        else:
            context["events"] = Event.objects.filter(admins__pk=request.user.pk).order_by('name')
            # context["usergroups"] = UserGroup.objects.filter(admins__pk=request.user.pk).order_by('name')

        # context["entry_templates"] = EntryTemplate.objects.filter(usergroup__members__pk=request.user.pk)
        # context["countries"] = Country.objects.all()
        # context["disaster_types"] = DisasterType.objects.all()
        # context["users"] = User.objects.all()

        if "selected" in request.GET:
            context["selected_event"] = int(request.GET["selected"])

        if "selected_group" in request.GET:
            context["selected_group"] = int(request.GET["selected_group"])

        return render(request, "project/project-details.html", context)

    @method_decorator(login_required)
    def post(self, request, project_id):

        response = redirect('project:project_details')
        pk = request.POST["project-pk"]

        if "save" in request.POST:
            if pk == "new":
                event = Event()
                activity = CreationActivity()
            else:
                event = Event.objects.get(pk=int(pk))
                activity = EditionActivity()

            event.name = request.POST["project-name"]
            event.description = request.POST["project-description"]

            if request.POST["project-status"] and request.POST["project-status"] != "":
                event.status = int(request.POST["project-status"])

            if request.POST["disaster-type"] and request.POST["disaster-type"] != "":
                event.disaster_type = DisasterType.objects.get(pk=int(request.POST["disaster-type"]))
            else:
                event.disaster_type = None

            if request.POST["project-start-date"] and request.POST["project-start-date"] != "":
                event.start_date = request.POST["project-start-date"]
            else:
                event.start_date = None

            if request.POST["project-end-date"] and request.POST["project-end-date"] != "":
                event.end_date = request.POST["project-end-date"]
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

            if 'entry-template' in request.POST:
                if request.POST["entry-template"] and request.POST["entry-template"] != "":
                    event.entry_template = EntryTemplate.objects.get(pk=int(request.POST["entry-template"]))
                else:
                    event.entry_template = None
            event.save()

            if event.admins.count() == 0:
                event.admins.add(request.user)

            activity.set_target(
                'project', event.pk, event.name,
                reverse('project:project_details') + '?selected=' + str(event.pk)
            ).log_for(request.user, event=event)

            event.assignee.clear()
            if "assigned-to" in request.POST and request.POST["assigned-to"]:
                for assigned_to in request.POST.getlist("assigned-to"):
                    event.assignee.add(User.objects.get(pk=int(assigned_to)))

            event.admins.clear()
            if "admins" in request.POST and request.POST["admins"]:
                for admin in request.POST.getlist("admins"):
                    event.admins.add(User.objects.get(pk=int(admin)))

            event.members.clear()
            if "members" in request.POST and request.POST["members"]:
                for member in request.POST.getlist("members"):
                    event.members.add(User.objects.get(pk=int(member)))

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
                            reverse('project:project_details') + '?selected=' + str(event.pk)
                        ).log_for(request.user, event=event, group=usergroup)

            for ug in prev_groups:
                if ug not in new_groups:
                    RemovalActivity().set_target(
                        'project', event.pk, event.name,
                        reverse('project:project_details') + '?selected=' + str(event.pk)
                    ).log_for(request.user, event=event, group=ug)

            response["Location"] += "?selected="+str(event.pk)

        elif "delete" in request.POST:
            if pk != "new":
                Event.objects.get(pk=int(pk)).delete()

        return response

class GeoAreaView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "geo-area"

        return render(request, "project/geo-area.html", context)

class AnalysisFrameworkView(View):
    @method_decorator(login_required)
    def get(self, request, project_id):
        context = {}
        context["project_id"] = project_id
        context["current_page"] = "analysis-framework"

        return render(request, "project/analysis-framework.html", context)

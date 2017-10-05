from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.http import JsonResponse, HttpResponseForbidden
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django import forms
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from report.models import *
from usergroup.models import *
from users.hid import *
from deep.json_utils import *
from users.log import *

from datetime import datetime, timedelta, date


class RegisterView(View):
    """ Register view
    """

    def get(self, request):
        # Return the register template.
        context = {}
        context['countries'] = Country.objects.filter(
            reference_country=None).distinct()
        return render(request, "users/register.html", context)

    def post(self, request):

        # Get the POST data.
        first_name = request.POST["first-name"]
        last_name = request.POST["last-name"]
        email = request.POST["email"]
        password = request.POST["password"]
        repassword = request.POST["re-password"]
        organization = request.POST["organization"]
        country_code = request.POST['country']

        error = ""

        # Validate email and password.
        try:
            validate_email(email)
        except forms.ValidationError:
            error = "Invalid email"

        if error == "":
            if User.objects.filter(username=email).count() > 0:
                error = "Email already registered."

            elif repassword != password:
                error = "Passwords do not match"

        # If there is no error, create new user.
        if error == "":
            user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                username=email,
                email=email,
                password=password
            )
            user.save()

            profile = UserProfile()
            profile.user = user
            profile.organization = organization
            profile.country = Country.objects.get(code=country_code)
            profile.save()

            user = authenticate(username=email, password=password)
            login(request, user)

        # Otherwise, display the register form with error.
        else:
            context = {"error": error}
            context["first_name"] = first_name
            context["last_name"] = last_name
            context["email"] = email
            context["organization"] = organization
            context["country_code"] = country_code
            context['countries'] = Country.objects.filter(
                reference_country=None).distinct()
            return render(request, "users/register.html", context)
        return redirect("login")


class LoginView(View):
    """ Login view
    """

    def get(self, request):

        # If user is already logged in, redirect to dashboard.
        if request.user and request.user.is_active:
            try:
                last_event = UserProfile.get_last_event(request)
                # if request.GET.get('next'):
                #     return redirect(request.GET['next'])
                if last_event:
                    return redirect("dashboard", last_event.pk)
                profile = UserProfile.objects.get(user=request.user)
                return redirect("dashboard")
            except:
                pass

        # See if we have an access_token in session
        # and try get the user details from hid
        hid = HumanitarianId(request)
        if hid.status:
            # We have a valid hunitarian id
            # If there's a user with this id, login with that user
            hid_uid = hid.data['_id']
            try:
                user = User.objects.get(userprofile__hid=hid_uid)
                user.backend = settings.AUTHENTICATION_BACKENDS[0]
            # If there's no user, check if one with same email exists
            # and link the user, otherwise create new user
            except:
                try:
                    user = User.objects.get(email=hid.data['email'])
                    user.userprofile.hid = hid_uid
                    user.backend = settings.AUTHENTICATION_BACKENDS[0]
                except:
                    username, password = hid.create_user()
                    user = authenticate(username=username, password=hid.data['user_id'])

            # update user data from hid
            hid.save_user(user.userprofile)

            login(request, user)
            return redirect('login')

        # Return the login template.
        return render(request, "users/login.html")

    def post(self, request):

        # Get POST data and authenticate the user.
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(username=email, password=password)

        error = "Invalid Credentials"

        # If user exists and is not disabled,
        # try getting profile of the user as well.
        # On success, login with the user and redirect to dashboard.
        if user is not None:
            if user.is_active:
                try:
                    profile = UserProfile.objects.get(user=user)
                    login(request, user)

                    next_page = request.POST.get('next')
                    if next_page:
                        return redirect(next_page)

                    # if request.GET.get('next'):
                    #     return redirect(request.GET['next'])
                    last_event = UserProfile.get_last_event(request)
                    if last_event:
                        return redirect("dashboard", last_event.pk)
                    return redirect("dashboard")
                except:
                    error = "Your profile is not registered properly"

        context = {"error": error}
        context["email"] = email
        return render(request, "users/login.html", context)


class DashboardView(View):
    """ Dashboard view

    Display the home page, once logged in, with various information
    summary along with links to Leads, Entries and Reports pages.
    """

    @method_decorator(login_required)
    def get(self, request, event=None):
        if not event and "last_event" in request.GET and request.GET["last_event"]:
            last_event = UserProfile.get_last_event(request)
            if last_event:
                return redirect("dashboard", last_event.pk)

        context = {}
        context["current_page"] = "dashboard"
        context["all_events"] = Event.get_events_for(request.user)

        if context['all_events'].count() == 0:
            return redirect('user_profile', request.user.pk)

        if event:
            context["event"] = Event.objects.get(pk=event)
            if context['event'] not in context['all_events']:
                UserProfile.set_last_event(request, None)
                return redirect('dashboard')
            UserProfile.set_last_event(request, context["event"])
        else:
            UserProfile.set_last_event(request, None)


        # Filter options in dashboard
        context["disaster_types"] = DisasterType.objects.all()
        context["countries"] = Country.objects.filter(event__in=Event.objects.all())

        # Get active projects
        context["active_events"] = Event.objects.filter(end_date=None)
        context["leads"] = Lead.objects.all()
        context["informations"] = EntryInformation.objects.all()
        context["projects_per_country"] = {}

        # Get event for each country
        for country in context["countries"]:
            context["projects_per_country"][country] = Event.objects.filter(countries__pk=country.pk)
        return render(request, "users/dashboard.html", context)


class LogoutView(View):
    """ Logout view

    Automatically redirect to the login page once logged-out.
    """

    def get(self, request):
        logout(request)
        return redirect('login')


class HidAccessToken(View):
    def get(self, request):
        access_token = request.GET['access_token']
        state = int(request.GET.get('state', 1234))

        token, user_id = HumanitarianId.get_token_and_user_id(access_token)
        if state == 833912:  # DEEP12: link hid with current user
            if request.user and (request.user.userprofile.hid is None or request.user.userprofile.hid == ''):
                profile = request.user.userprofile
                profile.hid = user_id
                profile.save()

        logout(request)
        request.session['hid_token'] = token
        request.session['hid_user'] = user_id
        return redirect('login')


class UserStatusView(View):
    def get(self, request):
        # Return user log in status.
        if request.user and request.user.is_active:
            try:
                profile = UserProfile.objects.get(user=request.user)
                return JsonResponse({"status": "logged-in",
                                    "user_id": request.user.id,
                                    "last_event": profile.last_event.pk
                                     if profile.last_event else "null"})
            except:
                pass
        return JsonResponse({"status": "not logged-in"})


class UserProfileView(View):
    @method_decorator(login_required)
    def get(self, request, user_id):
        user = User.objects.get(pk=user_id)

        projects = list(user.event_set.all()) + list(user.events_owned.all())
        for usergroup in user.usergroup_set.all():
            projects.extend(list(usergroup.projects.all()))

        context = {
            'user': user,
            'projects': list(set(projects)),
            'countries': Country.objects.filter(
                reference_country=None).distinct(),
        }
        return render(request, "users/profile.html", context)

    @method_decorator(login_required)
    def post(self, request, user_id):
        data_in = get_json_request(request)
        if data_in:
            return self.handle_json_request(request, data_in, user_id)

        elif request.FILES and request.FILES.get('avatar'):
            try:
                user = User.objects.get(pk=user_id)
            except:
                return JsonError('Cannot find user')

            if user != request.user:
                return JSON_NOT_PERMITTED

            profile = user.userprofile;
            profile.photo = request.FILES.get('avatar')
            profile.save()

            return JsonResult(data={'done': True})

        else:
            return redirect(reverse('user_profile', args=[user_id]))

    def handle_json_request(self, original_request, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except:
            return JsonError('Cannot find user')

        if user != original_request.user:
            return JSON_NOT_PERMITTED

        response = {}

        # TODO check if user has permission for whatever request

        # Edit profile
        if request['request'] == 'edit-attributes':
            response['done'] = False
            user.first_name = request['firstName']
            user.last_name = request['lastName']

            profile = user.userprofile
            profile.organization = request['organization']
            if request.get('country'):
                profile.country = Country.objects.get(
                    code=request['country'])
            else:
                profile.country = None
            profile.save()
            user.save()
            response['done'] = True

        elif request['request'] == 'add-group':
            response['done'] = False
            try:
                name = request['name']
                description = request['description']
                if UserGroup.objects.filter(name=name).count() > 0:
                    response['nameExists'] = True
                else:
                    group = UserGroup(name=name, description=description, owner=original_request.user)
                    group.save()

                    group.members.add(original_request.user)
                    group.admins.add(original_request.user)
                    response['url'] = reverse('usergroup:user_group_panel', args=[group.slug])
                    response['done'] = True
            except Exception as e:
                raise e

        return JsonResult(data=response)

from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.http import JsonResponse
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django import forms
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from report.models import *
from users.hid import *

from datetime import datetime, timedelta, date


class RegisterView(View):
    """ Register view
    """

    def get(self, request):
        # Return the register template.
        return render(request, "users/register.html")

    def post(self, request):

        # Get the POST data.
        first_name = request.POST["first-name"]
        last_name = request.POST["last-name"]
        email = request.POST["email"]
        password = request.POST["password"]
        repassword = request.POST["re-password"]
        organization = request.POST["organization"]

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
                password=password
            )
            user.save()

            profile = UserProfile()
            profile.user = user
            profile.organization = organization
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
            hid_uid = hid.data['user_id']
            try:
                user = User.objects.get(userprofile__hid=hid_uid)
                user.backend = settings.AUTHENTICATION_BACKENDS[0]
            # If there's no user, create new one
            except:
                username, password = hid.create_user()
                user = authenticate(username=username, password=hid.data['id'])

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
        if event:
            context["event"] = Event.objects.get(pk=event)
            UserProfile.set_last_event(request, context["event"])
        else:
            UserProfile.set_last_event(request, None)
        context["all_events"] = Event.objects.all()

        # Filter options in dashboard
        context["disaster_types"] = DisasterType.objects.all()
        context["countries"] = Country.objects.filter(event__in=Event.objects.all())

        # Get active crises
        context["active_events"] = Event.objects.filter(end_date=None)
        context["leads"] = Lead.objects.all()
        context["informations"] = EntryInformation.objects.all()

        # Get weekly reports for timeline
        context["weekly_reports"] = []
        context["crises_per_country"] = {}

        weekly_reports = WeeklyReport.objects.all()
        if weekly_reports.count() > 0:
            # Get total number of weeks
            first_report = weekly_reports.last()
            last_report = weekly_reports.first()

            monday2 = last_report.start_date - timedelta(days=last_report.start_date.weekday())
            # monday1 = first_report.start_date - timedelta(days=first_report.start_date.weekday())
            # Actually use first monday of the year
            # Jan 4 is Week 1 (ISO)
            day4 = date(first_report.start_date.year, 1, 4)
            monday1 = day4 - timedelta(days=day4.weekday())

            weeks = max(int((monday2 - monday1).days/7 + 1), 14) + 2

            # For each week, store its date and the countries whose reports exist on that day
            for i in range(weeks):
                dt = monday1 + timedelta(days=7*i)

                label = 'W' + str(dt.isocalendar()[1])
                countries = []
                crises = []
                report_ids = []
                report_data = []
                report_created_dates = []
                context["weekly_reports"].append([dt, dt+timedelta(days=6), countries, crises, report_ids, label, report_data, report_created_dates])

                reports = WeeklyReport.objects.filter(start_date=dt)
                for report in reports:
                    countries.append(report.country)
                    crises.append(report.event)
                    report_ids.append(report.pk)
                    report_data.append(report.data)
                    report_created_dates.append(report.last_edited_at)


        # Get event for each country
        for country in context["countries"]:
            context["crises_per_country"][country] = []
            for crisis in Event.objects.filter(countries__pk=country.pk):
                context["crises_per_country"][country].append(crisis)

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
        state = int(request.GET['state'])

        request.session['hid_access_token'] = access_token
        print(state)
        print(state == 833912)
        if state == 833912:  # DEEP12: link hid with current user
            if request.user and (request.user.userprofile.hid is None or request.user.userprofile.hid == ''):
                hid = HumanitarianId(request)
                if hid.status:
                    profile = request.user.userprofile
                    profile.hid = hid.data['user_id']
                    profile.save()

        logout(request)
        request.session['hid_access_token'] = access_token
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
        context = { 'user': User.objects.get(pk=user_id) }
        return render(request, "users/profile.html", context)

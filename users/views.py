from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.http import JsonResponse
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django import forms

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from users.models import *
from leads.models import *
from report.models import *

from datetime import datetime, timedelta


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
        context["countries"] = Country.objects.all()

        # Get active crises
        context["active_events"] = Event.objects.filter(end_date=None)

        # Get weekly reports for timeline
        context["weekly_reports"] = []

        weekly_reports = WeeklyReport.objects.all()
        if weekly_reports.count() > 0:
            # Get total number of weeks
            first_report = weekly_reports[weekly_reports.count() - 1]
            last_report = weekly_reports[0]

            monday2 = last_report.start_date - timedelta(days=last_report.start_date.weekday())
            monday1 = first_report.start_date - timedelta(days=first_report.start_date.weekday())
            weeks = max(int((monday2 - monday1).days/7 + 1), 15)

            # For each week, store its date and the countries whose reports exist on that day
            for i in range(weeks):
                date = last_report.start_date + timedelta(days=7*i)

                countries = []
                c_reports = {}
                context["weekly_reports"].append([date, date+timedelta(days=6), countries, c_reports])

                reports = WeeklyReport.objects.filter(start_date=date)
                for report in reports:
                    c_reports[report.country] = report
                    countries.append(report.country)

        return render(request, "users/dashboard.html", context)


class LogoutView(View):
    """ Logout view

    Automatically redirect to the login page once logged-out.
    """

    def get(self, request):
        logout(request)
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

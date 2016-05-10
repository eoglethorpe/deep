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

        if repassword != password:
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
            return render(request, "users/register.html", context)
        return redirect("login")


class LoginView(View):
    """ Login view
    """

    def get(self, request):
        # If user is already logged in, redirect to dashboard.
        if request.user and request.user.is_active:
            try:
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
                    return redirect("dashboard")
                except:
                    error = "Your profile is not registered properly"

        context = {"error": error}
        return render(request, "users/login.html", context)


class DashboardView(View):
    """ Dashboard view

    Display the home page, once logged, in with various information
    summary along with links to Leads, Entries and Reports pages.
    """

    @method_decorator(login_required)
    def get(self, request, event=None):
        context = {}
        context["current_page"] = "dashboard"
        if event:
            context["event"] = Event.objects.get(pk=event)
            UserProfile.set_last_event(request, context["event"])
        context["all_events"] = Event.objects.all()
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
                                    "last_event": profile.last_event.pk
                                     if profile.last_event else "null"})
            except:
                pass
        return JsonResponse({"status": "not logged-in"})

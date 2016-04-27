from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django import forms

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from users.models import *


class RegisterView(View):
    def get(self, request):
        return render(request, "users/register.html")

    def post(self, request):

        first_name = request.POST["first-name"]
        last_name = request.POST["last-name"]
        email = request.POST["email"]
        password = request.POST["password"]
        repassword = request.POST["re-password"]
        organization = request.POST["organization"]

        error = ""

        try:
            validate_email(email)
        except forms.ValidationError:
            error = "Invalid email"

        if repassword != password:
            error = "Passwords do not match"

        if error == "":
            user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                username=email,
                password=password
            )
            user.save()

            profile = UserProfile()
            profile.organization = organization
            profile.save()

        else:
            context = {"error": error}
            return render(request, "users/register.html", context)


        return redirect("login")


class LoginView(View):
    def get(self, request):
        return render(request, "users/login.html")

    def post(self, request):
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(username=email, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect("dashboard")

        context = {"error": "Invalid credentials"}
        return render(request, "users/login.html", context)



class DashboardView(View):
    @method_decorator(login_required)
    def get(self, request):
        return render(request, "users/dashboard.html")


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('login')

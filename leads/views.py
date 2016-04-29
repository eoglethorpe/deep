from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView


class LeadsView(View):
    def get(self, request):
        context = {}
        context["current_page"] = "leads"
        return render(request, "leads/leads.html", context)

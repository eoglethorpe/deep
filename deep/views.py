from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView


class IndexView(View):
    def get(self, request):
        return redirect('login')


class ExtensionView(View):
    def get(self, request):
        return render(request, "deep/extension.html")

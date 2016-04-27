from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView


class IndexView(View):
    def get(self, request):
        return redirect('login')

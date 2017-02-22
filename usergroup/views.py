from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from usergroup.models import *
from deep.json_utils import *


class UserGroupPanelView(View):
    @method_decorator(login_required)
    def get(self, request, group_slug):
        context = {}
        context['usergroup'] = UserGroup.objects.get(slug=group_slug)
        return render(request, 'usergroup/user-group-panel.html', context)

    @method_decorator(login_required)
    def post(self, request, group_slug):
        data_in = get_json_request(request)
        if data_in:
            return self.handle_json_request(data_in, group_slug)
        else:
            return redirect('usergroup', args=[group_slug])

    def handle_json_request(self, request, group_slug):
        try:
            group = UserGroup.objects.get(slug=group_slug)
        except:
            return JsonError('Cannot find user group')

        response = {}

        # TODO check if user has permission for whatever request

        if request['request'] == 'removeMembers':
            response['removedMembers'] = []
            for pk in request['members']:
                try:
                    group.members.remove(User.objects.get(pk=pk))
                    response['removedMembers'].append(pk)
                except:
                    pass

        return JsonResult(data=response)

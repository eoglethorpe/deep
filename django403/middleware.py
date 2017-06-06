import django.http
import django.template

import django403.views as views


class Django403Middleware(object):
    def process_response(self, request, response):
        if isinstance(response, django.http.HttpResponseForbidden) \
                and set(dir(response)) == \
                set(dir(django.http.HttpResponseForbidden())):
            try:
                return views.access_denied(request)
            except django.template.TemplateDoesNotExist as e:
                return views.fallback_403(request)

        return response

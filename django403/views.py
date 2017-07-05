import django.http
import django.template
import django.template.loader
import django.utils.translation


def fallback_403(request):
    return django.http.HttpResponseForbidden('Forbidden')


def access_denied(request, template_name='403.html'):
    t = django.template.loader.get_template(template_name)
    return django.http.HttpResponseForbidden(
        t.render(django.template.RequestContext(request, {
            'request': request
        })))

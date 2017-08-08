from django import template

register = template.Library()


@register.filter('startswith')
def startswith(text, starts):
    return text.startswith(starts)

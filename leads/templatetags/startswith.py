from django import template

register = template.Library()


@register.filter('startswith')
def startswith(text, starts):
    if not text:
        return False
    return text.startswith(starts)

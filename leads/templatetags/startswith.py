from django import template

register = template.Library()


@register.filter('startswith')
def startswith(text, starts):
    if not text or not starts:
        return False
    return text.lower().startswith(starts.lower())

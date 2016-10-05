from django import template

register = template.Library()


@register.filter
def getfrom(key, dictionary):
    if key not in dictionary:
        return key
    return dictionary[key]

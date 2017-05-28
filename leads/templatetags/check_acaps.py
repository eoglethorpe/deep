from django import template


register = template.Library()

@register.filter
def allow_acaps(user):
    events = user.event_set.all() | user.events_owned.all()
    for event in events:
        if event.is_acaps():
            return True
    return False

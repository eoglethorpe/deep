from django import template
from django.db.models import Q
from usergroup.models import UserGroup


register = template.Library()

@register.filter
def allow_acaps(user):
    if UserGroup.objects.filter(Q(admins=user) | Q(members=user), acaps=True):
        return True

    events = user.event_set.all() | user.events_owned.all()
    for event in events:
        if event.is_acaps():
            return True
    return False

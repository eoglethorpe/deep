from entries.models import *
from django.db.models import Q
from django.utils.dateparse import parse_datetime

import json


def filter_informations(data, event=None):
    informations = EntryInformation.objects.all()

    if event:
        informations = informations.filter(entry__lead__event=event)
        if not event.entry_template:
            informations = informations.filter(entry__template__isnull=True)
        else:
            informations = informations.filter(entry__template__isnull=False)

    if data.get('leads'):
        informations = informations.filter(entry__lead__pk__in=json.loads(data.get('leads')))

    if data.get('excerpt'):
        informations = informations.filter(excerpt__icontains=data.get('excerpt'))
    if data.get('lead_title'):
        informations = informations.filter(entry__lead__name__icontains=data.get('lead_title'))
    if data.get('source'):
        informations = informations.filter(entry__lead__source_name__icontains=data.get('source'))
    if data.get('users'):
        informations = informations.filter(entry__created_by__pk__in=data.getlist('users'))
    if data.get('areas'):
        informations = informations.filter(map_selections__name__in=data.getlist('areas'))
    if data.get('affected_groups'):
        informations = informations.filter(affected_groups__pk__in=data.getlist('affected_groups'))
    if data.get('vulnerable_groups'):
        informations = informations.filter(vulnerable_groups__pk__in=data.getlist('vulnerable_groups'))
    if data.get('specific_needs_groups'):
        informations = informations.filter(specific_needs_groups__pk__in=data.getlist('specific_needs_groups'))

    if data.get('pillars'):
        pillars = []
        subpillars = []
        for value in data.getlist('pillars'):
            if ':' in value:
                value = value.split(':')
                subpillars.append(value[1])
            else:
                pillars.append(value)
        informations = informations.filter(
            Q(informationattribute__subpillar__pillar__pk__in=pillars) |
            Q(informationattribute__subpillar__pk__in=subpillars)
        )

    if data.get('sectors'):
        sectors = []
        subsectors = []
        for value in data.getlist('sectors'):
            if ':' in value:
                value = value.split(':')
                subsectors.append(value[1])
            else:
                sectors.append(value)

        informations = informations.filter(
            Q(informationattribute__sector__pk__in=sectors) |
            Q(informationattribute__subsectors__pk__in=subsectors)
        )

    if data.get('reliability_min') and data.get('reliability_max'):
        informations = informations.filter(
            reliability__level__gte=data.get('reliability_min'),
            reliability__level__lte=data.get('reliability_max'),
        )

    if data.get('severity_min') and data.get('severity_max'):
        informations = informations.filter(
            severity__level__gte=data.get('severity_min'),
            severity__level__lte=data.get('severity_max'),
        )

    if data.get('date_published_start') and data.get('date_published_end'):
        informations = informations.filter(
            entry__lead__published_at__gte=data.get('date_published_start'),
            entry__lead__published_at__lte=data.get('date_published_end')
        )

    if data.get('date_imported_start') and data.get('date_imported_end'):
        informations = informations.filter(
            entry__created_at__gte=data.get('date_imported_start'),
            entry__created_at__lte=data.get('date_imported_end')
        )


    return informations.distinct()

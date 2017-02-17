from leads.api_serializers import _getattr


def reliability_serializer(reliability):
    return {
            "id": reliability.pk,
            "name": reliability.name,
            "level": reliability.level,
            "is_default": reliability.is_default
        } if reliability else None


def severity_serializer(severity):
    return {
            "id": severity.id,
            "name": severity.name,
            "level": severity.level,
            "is_default": severity.is_default
        } if severity else None


def vulnerable_group_serializer(vulnerable_group):
    return {
                'id': vulnerable_group.pk,
                'name': vulnerable_group.name,
        } if vulnerable_group else None


def specific_needs_group_serializer(specific_needs_group):
    return {
                'id': specific_needs_group.id,
                'name': specific_needs_group.name
        } if specific_needs_group else None


def affected_group_serializer(affected_group):
    return {
            'id': affected_group.pk,
            'name': affected_group.name,
            'parent': _getattr(affected_group.parent, 'pk'),
        } if affected_group else None


def map_selection_serializer(map_selection):
    return {
            "id": map_selection.pk,
            "name": map_selection.name,
            "pcode": map_selection.pcode,
            "admin_level": _getattr(map_selection.admin_level,
                                    'pk'),
            "keyword": map_selection.get_keyword()
        } if map_selection else None


def pillar_serializer(pillar):
    return {
        "id": pillar.pk,
        "name": pillar.name,
        "contains_sectors": pillar.contains_sectors,
        "tooltip": pillar.tooltip,
        "background_color": pillar.background_color,
        "active_background_color":
            pillar.active_background_color,
        "appear_in": pillar.appear_in
    } if pillar else None


def subpillar_serializer(subpillar):
    return {
        "id": subpillar.pk,
        "name": subpillar.name,
        "tooltip": subpillar.tooltip,
        "pillar": pillar_serializer(subpillar.pillar)
    } if subpillar else None


def sector_serializer(sector):
    return {
        'id': sector.pk,
        'name': sector.name,
        'icon': _getattr(sector.icon, 'url'),
        } if sector else None


def subsector_serializer(subsector):
    return {
        "id": subsector.pk,
        "name": subsector.name,
        "sector": sector_serializer(subsector.sector)
    }


def attribute_serializer(attribute):
    return {
        "subpillar": subpillar_serializer(attribute.subpillar),
        "sector": sector_serializer(attribute.sector),
        "subsectors": [
            subsector_serializer(subsector)
            for subsector in attribute.subsectors.all()]
        } if attribute else None


def information_serializer(information):
    return {
        "id": information.pk,
        "excerpt": information.excerpt,
        "date": information.date,
        "reliability": reliability_serializer(information.reliability),
        "severity": severity_serializer(information.severity),
        "number": information.number,

        "vulnerable_groups": [
            vulnerable_group_serializer(v_g)
            for v_g in information.vulnerable_groups.all()
        ],

        "specific_needs_groups": [
            specific_needs_group_serializer(s_n_g)
            for s_n_g in information.specific_needs_groups.all()
        ],

        "affected_groups": [
            affected_group_serializer(a_g)
            for a_g in information.affected_groups.all()
        ],

        "map_selections": [
            map_selection_serializer(m_s)
            for m_s in information.map_selections.all()
        ],

        "attributes": [
            attribute_serializer(attr) for attr in
            information.informationattribute_set.all()
        ],

        "modified_by": _getattr(information.entry.modified_by,
                                'get_full_name',),
        "modified_at": _getattr(information.entry,
                                'modified_at'),
        "lead_title": _getattr(information.entry,
                               'lead.name'),
        "lead_source": _getattr(information.entry,
                                'lead.source.name'),
        "lead_published_at": _getattr(information.entry,
                                      'lead.published_at')
    }


def entry_serializer(entry):
    return {
        "id": entry.pk,
        "modified_at": entry.modified_at,
        "modified_by": _getattr(entry.modified_by,
                                'get_full_name'),
        "lead": _getattr(entry.lead, 'pk'),
        "lead_title": _getattr(entry.lead, 'name'),
        "lead_url": _getattr(entry.lead, 'url'),
        "lead_source_name": _getattr(entry.lead, 'source_name'),
        "informations": [
            information_serializer(inform)
            for inform in entry.entryinformation_set.all()
        ]
    }

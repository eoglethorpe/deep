from deep.serializer import Serializer
from entries.models import *
from leads.models import *

"""
Needed Extras:
    Subpillar, Pillar, Sector, Subector
"""

class PillarSerializer(Serializer):
    fields = {
        'id': 'pk', 'name': 'name',
        'has_sectors': 'contains_sectors',
        'belongs_to': 'get_appear_in_display',
    }


class SubpillarSerializer(Serializer):
    fields = {
        'id': 'pk', 'name': 'name', 'pillar': 'pillar_pk'
    }


class SectorSerializer(Serializer):
    fields = {
        'id': 'pk', 'name': 'name', 'icon': 'icon.url'
    }


class SubsectorSerializer(Serializer):
    fields = {
        'id': 'pk', 'name': 'name', 'sector': 'sector.pk'
    }


class EntryInformationSerializer(Serializer):
    fields = {
        'id': 'pk',
        'excerpt': 'excerpt',
        'attributes': 'attributes',
        'map_selections': 'map_selections',
        # 'number': 'number',
        'date': 'date',
        'reliability': 'reliability.level',
        'severity': 'severity.level',
        'affected_groups': 'affected_groups',
        'demographic_groups': 'vulnerable_groups',
        'specific_needs_groups': 'specific_needs_groups',
    }

    def get_map_selections(self, info):
        return [
            {
                'name': ms.name, 'pcode': ms.pcode,
                'country': ms.admin_level.country.code,
                'level': ms.admin_level.level,
                'keyword': ms.get_keyword()
            } for ms in info.map_selections.all()
        ]

    def get_attributes(self, info):
        return [
            {
                'pillar': attr.subpillar.pillar.pk,
                'subpillar': attr.subpillar.pk,
                'sector': attr.sector.pk if attr.sector else None,
                'subsectors': [ ss.pk for ss in attr.subsectors.all() ]
            } for attr in info.informationattribute_set.all()
        ]

    def get_vulnerable_groups(self, info):
        return [ vg.name for vg in info.vulnerable_groups.all() ]

    def get_specific_needs_groups(self, info):
        return [ sg.name for sg in info.specific_needs_groups.all() ]

    def get_affected_groups(self, info):
        return [ag.name for ag in info.affected_groups.all() ]


class EntrySerializer(Serializer):
    fields = {
        'id': 'pk',
        'event': 'lead.event.pk',
        'modified_at': 'modified_at',
        'modified_by': 'modified_by.pk',
        'modified_by_name': 'modified_by.get_full_name',
        
        'created_at': 'created_at',
        'created_by': 'created_by.pk',
        'created_by_name': 'created_by.get_full_name',

        'lead': 'lead.pk',
        'lead_title': 'lead.name',
        'lead_url': 'lead_url',
        'lead_source': 'lead.source_name',
        'lead_published_at': 'lead.published_at',

        'informations': 'informations',
    }

    def get_lead_url(self, entry):
        if entry.lead.url and entry.lead.url != "":
            return entry.lead.url
        elif Attachment.objects.filter(lead=entry.lead).count() > 0:
            return entry.lead.attachment.upload.url
        return None

    def get_informations(self, entry):
        return [
            EntryInformationSerializer(information).serialize()
            for information in entry.entryinformation_set.all()
        ]

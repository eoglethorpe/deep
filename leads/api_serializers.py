
from deep.serializer import Serializer
from leads.models import *

import os
import json


class CountrySerializer(Serializer):
    fields = {
        'code': 'code',
        'name': 'name',
        'key_figures': 'key_figures',
        'media_sources': 'media_sources',
        'regions': 'regions',
        'admin_levels': 'admin_levels',
        'reference_code': 'reference_code',
    }

    def get_reference_code(self, country):
        if country.reference_country:
            return country.reference_country.code
        return country.code

    def get_key_figures(self, country):
        return json.loads(country.key_figures)

    def get_media_sources(self, country):
        return json.loads(country.media_sources)

    def get_regions(self, country):
        return json.loads(country.regions)

    def get_admin_levels(self, country):
        return [
            {
                'id': al.id,
                'level': al.level, 'name': al.name,
                'property_name': al.property_name,
                'property_pcode': al.property_pcode,
                'geojson': al.geojson.url,
            } for al in country.adminlevel_set.all()
        ]


class EventSerializer(Serializer):
    fields = {
        'id': 'pk',
        'name': 'name',
        'countries': 'countries',
        'disaster_type': 'disaster_type.name',
        'assigned_to': 'assignee',
        'glide_number': 'glide_number',
        'spill_over': 'spill_over.pk',
        'start_date': 'start_date',
        'end_date': 'end_date',
        'status': 'get_status_display',
    }

    def get_countries(self, event):
        return [ country.code for country in event.countries.all() ]

    def get_assignee(self, event):
        return [ a.name for a in event.assignee.all() ]


class LeadSerializer(Serializer):
    fields = {
        'id': 'pk',
        'event': 'event.pk',
        'created_at': 'created_at',
        'created_by': 'created_by.pk',
        'created_by_name': 'created_by.get_full_name',
        'name': 'name',
        'source': 'source_name',
        'assigned_to': 'assigned_to.pk',
        'assigned_to_name': 'assigned_to.get_full_name',
        'published_at': 'published_at',
        'confidentiality': 'confidentiality',
        'status': 'status',
        'lead_type': 'lead_type',
        'description': 'description',
        'url': 'url',
        'website': 'website',
        'attachment': 'attachment',
        'number_of_entries': 'number_of_entries',

        'format': 'format',
        'link': 'link',
    }

    def get_attachment(self, lead):
        try:
            attachment = lead.attachment
            return {
                'name': os.path.basename(attachment.upload.name),
                'url': attachment.upload.url
            }
        except Exception as e:
            return None

    def get_number_of_entries(self, lead):
        total = 0
        for entry in lead.entry_set.all():
            total += entry.entryinformation_set.count()
        return total

    def get_link(self, lead):
        if lead.lead_type == 'URL':
            return lead.url

        elif lead.lead_type == 'ATT' and \
                Attachment.objects.filter(lead=lead).count() > 0:
            return lead.attachment.upload.url
        return None

    def get_format(self, lead):
        link = self.get_link(lead)
        if link:
            ext = link.rpartition('.')[-1]
            if len(ext) <= 4:
                return ext.lower()
        return None


class SosSerializer(Serializer):
    fields = {
        'id': 'pk',
        'event': 'lead.event.pk',
        'lead': 'lead.pk',
        'lead_title': 'lead.name',
        'created_at': 'created_at',
        'created_by': 'created_by.pk',
        'created_by_name': 'created_by.get_full_name',
        'title': 'title',
        'lead_organization': 'lead_organization',
        'partners': 'partners',
        'proximity_to_source': 'proximity_to_source.name',
        'unit_of_analysis': 'unit_of_analysis',
        'start_data_collection': 'start_data_collection',
        'end_data_collection': 'end_data_collection',
        'data_collection_technique': 'data_collection_technique',
        'sectors_covered': 'sectors_covered',
        'sampling_type': 'sampling_type.name',
        'frequency': 'frequency.name',
        'status': 'status.name',
        'confidentiality': 'confidentiality.name',
        'affected_groups': 'affected_groups',
        # TODO Map selections
        'areas_summary': 'areas_summary',
    }

    def get_unit_of_analysis(self, sos):
        return  [ unit.name for unit in sos.unit_of_analysis.all() ]

    def get_data_collection_technique(self, sos):
        return [
            data_coll.name for data_coll in sos.data_collection_technique.all()
        ]

    def get_sectors_covered(self, sos):
        scs = json.loads(sos.sectors_covered)
        data = {}
        for sc in scs:
            if (sc["quantification"] and not SectorQuantification.objects.get(pk=sc["quantification"]).is_default) \
                or \
                (sc["analytical_value"] and not SectorAnalyticalValue.objects.get(pk=sc["analytical_value"]).is_default):
                data[sc["title"]] = {
                    "quantification": SectorQuantification.objects.get(pk=sc["quantification"]).name if sc["quantification"] != '' else '',
                    "analytical_value": SectorAnalyticalValue.objects.get(pk=sc["analytical_value"]).name if sc["analytical_value"] != '' else '',
                }
        return data

    def get_affected_groups(self, sos):
        return json.loads(sos.affected_groups)

    def get_areas_summary(self, sos):
        return ", ".join(list(set([s.name for s in sos.map_selections.all()])))

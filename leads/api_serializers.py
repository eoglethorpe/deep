
from deep.serializer import Serializer
from leads.models import *


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
    }

    def get_attachment(self, lead):
        try:
            attachment = lead.attachment
            return {
                'name': os.path.basename(attachment.upload.name),
                'url': attachment.upload.url
            }
        except:
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
            # TODO: check if values are default instead of "1"
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






# TODO: Navin code hataune :P

def _getattr(object, attrs):
    attrs = attrs.split('.')
    # Avoiding Copy of Object(For Avoiding Reference)
    value = getattr(object, attrs.pop(0), None)
    if callable(value):
        value = value()

    for attr in attrs:
        value = getattr(value, attr, None)
        if callable(value):
            value = value()
    return value
#
#
# def lead_serializer(lead):
#     try:
#         attachment = lead.attachment
#         attachment = [
#             os.path.basename(attachment.upload.name),
#             attachment.upload.url
#             ]
#     except:
#         attachment = None
#
#     return {
#         "id": lead.pk,
#         "name": lead.name,
#         "source": lead.source_name,
#         "assigned_to": _getattr(lead.assigned_to, 'pk'),
#         "published_at": lead.published_at,
#         "confidentiality": lead.confidentiality,
#         "status": lead.status,
#         "description": lead.description,
#         "url": lead.url,
#         "website": lead.website,
#         "created_at": lead.created_at,
#         "created_by": _getattr(lead.created_by, 'pk'),
#         "attachment": attachment,
#         "assigned_to_name": _getattr(lead.assigned_to, 'get_full_name'),
#         "created_by_name": _getattr(lead.created_by, 'get_full_name'),
#         "event": lead.event.id,
#         "lead_type": lead.lead_type
#     } if lead else None
#
#
# def survey_of_survey_serializer(object):
#     return {
#         "id": object.pk,
#         "created_at": object.created_at,
#         "created_by_name": _getattr(object.created_by, 'get_full_name'),
#         "title": object.title,
#         "lead_organization": object.lead_organization,
#         "partners": object.partners,
#         "proximity_to_source": _getattr(object.proximity_to_source, 'name'),
#         "unit_of_analysis": [
#             unit.name for unit in object.unit_of_analysis.all()
#         ],
#         "start_data_collection": object.start_data_collection,
#         "end_data_collection": object.end_data_collection,
#         "data_collection_technique": [
#             data_coll.name
#             for data_coll in object.data_collection_technique.all()
#         ],
#         "sectors_covered": json.loads(object.sectors_covered),
#         "sampling_type": _getattr(object.sampling_type, 'name'),
#         "frequency": _getattr(object.frequency, 'name'),
#         "status": _getattr(object.status, 'name'),
#         "confidentiality": _getattr(object.confidentiality, 'name'),
#         # "countries": {},
#         # "areas_summary": '',
#         "affected_groups": json.loads(object.affected_groups),
#         "lead": lead_serializer(object.lead),
#         "lead_id": _getattr(object.lead, 'pk')
#     }

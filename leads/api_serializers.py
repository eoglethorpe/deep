import os
import json


def _getattr(object, attrs):
    attrs = attrs.split('.')
    # Avoiding Copy of Object(For Avoiding Reference)
    value = getattr(object, attrs.pop(0), None)
    if(callable(value)):
        value = value()

    for attr in attrs:
        value = getattr(value, attr, None)
        if(callable(value)):
            value = value()
    return value


def lead_serializer(lead):
    try:
        attachment = lead.attachment
        attachment = [
            os.path.basename(attachment.upload.name),
            attachment.upload.url
            ]
    except:
        attachment = None

    return {
        "id": lead.pk,
        "name": lead.name,
        "source": lead.source_name,
        "assigned_to": getattr(lead.assigned_to, 'pk', None),
        "published_at": lead.published_at,
        "confidentiality": lead.confidentiality,
        "status": lead.status,
        "description": lead.description,
        "url": lead.url,
        "website": lead.website,
        "created_at": lead.created_at,
        "created_by": getattr(lead.created_by, 'pk', None),
        "attachment": attachment,
        "assigned_to_name": getattr(lead.assigned_to,
                                    'get_full_name',
                                    lambda: None)(),
        "created_by_name": getattr(lead.created_by,
                                   'get_full_name',
                                   lambda: None)(),
        "event": lead.event.id,
        "lead_type": lead.lead_type
    } if lead else None


def survey_of_survey_serialzer(object):
    return {
        "id": object.pk,
        "created_at": object.created_at,
        "created_by_name": _getattr(object.created_by,
                                    'name.get_full_name'),
        "title": object.title,
        "lead_organization": object.lead_organization,
        "partners": object.partners,
        "proximity_to_source": _getattr(object.proximity_to_source,
                                        'name'),
        "unit_of_analysis": [
            unit.name for unit in object.unit_of_analysis.all()
        ],
        "start_data_collection": object.start_data_collection,
        "end_data_collection": object.end_data_collection,
        "data_collection_technique": [
            data_coll.name
            for data_coll in object.data_collection_technique.all()
        ],
        "sectors_covered": json.loads(object.sectors_covered),
        "sampling_type": _getattr(object.sampling_type, 'name'),
        "frequency": _getattr(object.frequency, 'name'),
        "status": _getattr(object.status, 'name'),
        "confidentiality": _getattr(object.confidentiality, 'name'),
        # "countries": {},
        # "areas_summary": '',
        "affected_groups": json.loads(object.affected_groups),
        "lead": lead_serializer(object.lead),
        "lead_id": _getattr(object.lead, 'pk')
    }

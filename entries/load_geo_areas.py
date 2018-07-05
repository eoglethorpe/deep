import os
import json


def load_geo_areas(admin_level):
    filefield = admin_level.geojson
    if not filefield:
        return []

    # if not os.path.isfile(filefield.path):
    #     return []

    try:
        data = json.loads(filefield.read().decode('utf-8'))
        features = data['features']
        result = []
        for feature in features:
            properties = feature['properties']

            name = properties[admin_level.property_name]
            pcode = None
            selection_name = '{}:{}:{}'.format(
                admin_level.country.code,
                admin_level.level,
                name,
            )
            if admin_level.property_pcode:
                pcode = properties[admin_level.property_pcode]
                selection_name = '{}:{}'.format(selection_name, pcode)

            result.append({
                'selection_name': selection_name,
                'name': name,
                'pcode': pcode,
            })
        return result
    except Exception:
        return []

    return []

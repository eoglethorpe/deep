from entries.models import *
from geojson_handler import GeoJsonHandler


def refresh_pcodes():
    map_selections = AdminLevelSelection.objects.all()
    admin_features = {}
    for s in map_selections:
        al = s.admin_level
        if al.geojson == None or al.property_pcode == "" or s.pcode != "":
            continue

        if al.pk not in admin_features:
            admin_features[al.pk] = GeoJsonHandler(al.geojson.read().decode())

        features = admin_features[al.pk].filter_features(al.property_name, s.name)
        if len(features) > 0:
            try:
                s.pcode = features[0]["properties"][al.property_pcode]
                s.save()
            except:
                pass

import json


class GeoJsonHandler:
    def __init__(self, jsonstring):
        self.data = json.loads(jsonstring)

    def filter_features(self, propname, value):
        features = self.data["features"]
        return [
            f for f in features if
            propname in f["properties"] and f["properties"][propname] == value
        ]

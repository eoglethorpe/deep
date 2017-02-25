import json


class Serializer:
    fields = {}

    def __init__(self, object):
        self.object = object

    def get_value(self, attribute):
        try:
            if not isinstance(attribute, str):
                return attribute

            method = getattr(self, 'get_' + attribute, None)
            if callable(method):
                return method(self.object)

            attrs = attribute.split('.')
            value = self.object
            for attr in attrs:
                value = getattr(value, attr, None)
                if callable(value):
                    value = value()
            return value
        except Exception as e:
            return None

    def serialize(self):
        return { key: self.get_value(value) for key, value in self.fields.items() }

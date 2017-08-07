from django.conf import settings
from django.utils import timezone
from datetime import datetime

import os
import json


class DeepStorage:

    def __init__(self, location, type=None):
        self.type = type if type else 'media'
        self.location = location if location else 'media/'
        self.storage = self.get_storage()

    def use_s3(self):
        return os.environ.get('USE_S3', False)

    def join_path(self, path, base=True):
        """
        For non S3
        """
        if base:
            return os.path.join(self.storage, path)
        return os.path.join(self.location, path)

    def get_updated_time(self, path):
        if self.use_s3():
            return self.storage.get_modified_time(path)
        else:
            return timezone.make_aware(datetime.utcfromtimestamp(
                    os.path.getmtime(self.join_path(path))))

    def get_updated_diff(self, path, start=None):
        start = start if start else timezone.now()
        return start - self.get_updated_time(path)

    def get_storage(self):
        if self.use_s3():
            from deep.s3_storages import StaticStorage, MediaStorage
            if self.type == 'static':
                self.storage = StaticStorage(location=self.location)
            else:
                self.storage = MediaStorage(location=self.location)
        else:
            self.storage = os.path.join(settings.BASE_DIR, self.location)
        return self.storage

    def create_dirs(self, location=None):
        if not self.use_s3():
            try:
                os.makedirs(os.path.join(settings.BASE_DIR, location)
                            if location else self.storage)
            except:
                pass

    def url(self, path):
        if self.use_s3():
            return self.storage.url(path)
        else:
            return self.join_path(path, base=False)

    def open(self, path, mode='r'):
        if self.use_s3():
            return self.storage.open(path, mode)
        else:
            return open(self.join_path(path), mode)

    def write_json(self, path, data, **kwrags):
        if self.use_s3():
            with self.storage.open(path, 'w') as f:
                json.dump(data, f, **kwrags)
        else:
            with open(self.join_path(path), 'w') as f:
                json.dump(data, f, **kwrags)


StaticApiStorage = DeepStorage(location='static/api', type='static')
DeepMediaStorage = DeepStorage(location='media', type='media')
DeepStaticStorage = DeepStorage(location='static', type='static')

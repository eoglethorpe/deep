from django.conf import settings
from django.utils import timezone
from datetime import datetime

import os
import json
import time
import tempfile


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


class TempDeepStorage(DeepStorage):

    def __init__(self, exp_min=30, *args, **kwargs):
        super(TempDeepStorage, self).__init__(*args, **kwargs)
        self.exp_min = exp_min

    def clean_files(self):
        """
        DANGER: this will delete the files, only for temp downloads
        Use for non s3, we can create S3 expire rules[Lifecycle].
        """
        if not self.use_s3():
            current_time = time.time()
            for f in os.listdir(self.storage):
                file = os.path.join(self.storage, f)
                creation_time = os.path.getctime(file)
                if (current_time - creation_time) >= self.exp_min*60:
                    os.remove(file)

    def open_temp(self, delete=False):
        if self.use_s3():
            """
            TODO: generate random filename from other method
            """
            random = tempfile.NamedTemporaryFile(dir='/tmp',
                                                 delete=True)
            random.close()
            return self.storage.open(random.name.rsplit('/')[-1], 'w')
        else:
            return tempfile.NamedTemporaryFile(dir=self.storage, delete=delete)


StaticApiStorage = DeepStorage(location='static/api', type='static')
TempDownloadStorage = TempDeepStorage(exp_min=30, location='temp_downloads',
                                      type='media')

DeepMediaStorage = DeepStorage(location='media', type='media')
DeepStaticStorage = DeepStorage(location='static', type='static')

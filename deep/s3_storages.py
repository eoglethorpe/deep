from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    location = settings.STATICFILES_LOCATION
    # bucket_name = settings.AWS_STORAGE_BUCKET_NAME


class MediaStorage(S3Boto3Storage):
    location = settings.MEDIAFILES_LOCATION
    # bucket_name = settings.AWS_STORAGE_BUCKET_NAME

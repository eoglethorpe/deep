from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    """ Event Model

    Contains leads and their entries.
    """

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Source(models.Model):
    """ Source Model

    Sources are available lead sources.
    """

    source = models.CharField(max_length=100, primary_key=True)

    def __str__(self):
        return self.source


class Lead(models.Model):
    """ Lead Model
    """

    # Confidentiality choices, currently including public and confidential.
    UNPROTECTED = 'UNP'
    PROTECTED = 'PRO'
    RESTRICTED = 'RES'
    CONFIDENTIAL = 'CON'

    CONFIDENTIALITIES = (
        (UNPROTECTED, 'Unprotected'),
        (PROTECTED, 'Protected'),
        (RESTRICTED, 'Restricted'),
        (CONFIDENTIAL, 'Confidential'),
    )

    # Status of a lead that can be pending, processed or deleted.
    PENDING = 'PEN'
    PROCESSED = 'PRO'
    DELETED = 'DEL'

    STATUSES = (
        (PENDING, 'Pending'),
        (PROCESSED, 'Processed'),
        (DELETED, 'Deleted'),
    )

    # Lead types.
    URL_LEAD = 'URL'
    MANUAL_LEAD = 'MAN'
    ATTACHMENT_LEAD = 'ATT'
    SOS_LEAD = 'SOS'

    LEAD_TYPES = (
        (URL_LEAD, 'Url'),
        (MANUAL_LEAD, 'Manual'),
        (ATTACHMENT_LEAD, 'Attachments'),
        (SOS_LEAD, "Survey of surveys"),
    )

    # Lead attributes.
    name = models.CharField(max_length=250)
    event = models.ForeignKey(Event, default=None, null=True)
    source = models.ForeignKey(Source, null=True, blank=True)
    assigned_to = models.ForeignKey(User, null=True, blank=True,
                                    related_name='assigned_leads')
    published_at = models.DateField(null=True, blank=True)

    confidentiality = models.CharField(max_length=3,
                                       choices=CONFIDENTIALITIES,
                                       default=UNPROTECTED)
    status = models.CharField(max_length=3,
                              choices=STATUSES,
                              default=PENDING)
    lead_type = models.CharField(max_length=3,
                                 choices=LEAD_TYPES,
                                 default=MANUAL_LEAD)

    description = models.TextField(blank=True, null=True)
    url = models.TextField(blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User)

    def __str__(self):
        return self.name


class Attachment(models.Model):
    """ Attachment model

    It represents an uploaded file and belongs to a lead.
    """

    lead = models.ForeignKey(Lead)
    upload = models.FileField(upload_to='attachments/%Y/%m/')

    def __str__(self):
        return self.lead.name + ' - ' + self.upload.name

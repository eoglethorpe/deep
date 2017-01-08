from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver

from datetime import datetime, date


class Country(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=70)

    # Key figures
    hdi_index = models.CharField(max_length=100, default='', blank=True)
    hdi_rank = models.CharField(max_length=100, default='', blank=True)
    u5m = models.CharField(max_length=100, default='', blank=True)

    number_of_refugees = models.CharField(max_length=100, default='', blank=True)
    number_of_idps = models.CharField(max_length=100, default='', blank=True)
    number_of_returned_refugees = models.CharField(max_length=100, default='', blank=True)

    total_population = models.CharField(max_length=100, default='', blank=True)
    population_source = models.CharField(max_length=250, default='', blank=True)

    inform_score = models.CharField(max_length=100, default='', blank=True)
    inform_risk_index = models.CharField(max_length=100, default='', blank=True)
    inform_hazard_and_exposure = models.CharField(max_length=100, default='', blank=True)
    inform_vulnerability = models.CharField(max_length=100, default='', blank=True)
    inform_lack_of_coping_capacity = models.CharField(max_length=100, default='', blank=True)

    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'countries'


class Event(models.Model):
    """ Event Model

    Contains leads and their entries.
    """

    name = models.CharField(max_length=100)
    countries = models.ManyToManyField(Country, blank=True)
    disaster_type = models.ForeignKey('report.DisasterType', null=True, blank=True, default=None)

    # TO DELETE
    assigned_to = models.ForeignKey(User, null=True, blank=True, default=None, related_name="event_donot_use", verbose_name="DO NOT USE")

    assignee = models.ManyToManyField(User, blank=True)

    glide_number = models.CharField(max_length=100, null=True, blank=True, default=None)
    spill_over = models.ForeignKey('Event', null=True, blank=True, default=None)

    start_date = models.DateField(default=datetime(2016, 1, 1))
    end_date = models.DateField(null=True, blank=True, default=None)

    def __str__(self):
        return self.name


class Source(models.Model):
    """ Source Model

    Sources are available lead sources.
    """

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


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
    source_name = models.CharField(max_length=250, default=None,
                                   null=True, blank=True)
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

    lead = models.OneToOneField(Lead)
    upload = models.FileField(upload_to='attachments/%Y/%m/')

    def __str__(self):
        return self.lead.name + ' - ' + self.upload.name


class SimplifiedLead(models.Model):
    lead = models.OneToOneField(Lead)
    # simplified text
    text = models.TextField()

    def __str__(self):
        return self.lead.name

@receiver(pre_delete, sender=Attachment)
def _attachment_delete(sender, instance, **kwargs):
    instance.upload.delete(False)


"""Survey of survey """


class ProximityToSource(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Proximity to Sources"


class UnitOfAnalysis(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Units of Analysis"


class DataCollectionTechnique(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Data Collection Techniques"



class SamplingType(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Sampling Types"

class SectorQuantification(models.Model):
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class SectorAnalyticalValue(models.Model):
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Sector Analytical Values"

class AssessmentFrequency(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Assessment Frequencies"


class AssessmentConfidentiality(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Assessment Confidentialities"


class AssessmentStatus(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Assessment Statuses"


class SurveyOfSurvey(models.Model):
    lead = models.ForeignKey(Lead)

    title = models.CharField(max_length=200)
    lead_organization = models.CharField(max_length=200, blank=True, null=True)
    partners = models.TextField(blank=True)

    map_selections = models.ManyToManyField('entries.AdminLevelSelection', blank=True)
    proximity_to_source = models.ForeignKey(ProximityToSource, blank=True, null=True)
    unit_of_analysis = models.ManyToManyField(UnitOfAnalysis, blank=True)
    data_collection_technique = models.ManyToManyField(DataCollectionTechnique, blank=True)
    start_data_collection = models.DateField(null=True, default=None, blank=True)
    end_data_collection = models.DateField(null=True, default=None, blank=True)
    sampling_type = models.ForeignKey(SamplingType, blank=True, null=True)
    frequency = models.ForeignKey(AssessmentFrequency, blank=True, null=True)
    status = models.ForeignKey(AssessmentStatus, blank=True, null=True)
    confidentiality = models.ForeignKey(AssessmentConfidentiality, blank=True, null=True)

    sectors_covered = models.TextField(default="{}")

    # TODO Fix db constraint bug to use manytomanyfield
    # affected_groups = models.ManyToManyField('entries.AffectedGroup', blank=True)
    affected_groups = models.TextField(default="[]")

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Survey of Surveys"



class SectorCovered(models.Model):
    name = models.CharField(max_length=100)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.identifier = "-".join(self.name.lower().split())

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Sectors Covered"

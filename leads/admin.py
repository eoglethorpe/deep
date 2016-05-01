from django.contrib import admin
from leads.models import *


class AttachmentInline(admin.StackedInline):
    model = Attachment


class LeadAdmin(admin.ModelAdmin):
    inlines = [AttachmentInline, ]


admin.site.register(Source)
admin.site.register(ContentFormat)
admin.site.register(Lead, LeadAdmin)

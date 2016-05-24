from django.contrib import admin
from entries.models import *


class VulnerableGroupDataInline(admin.StackedInline):
    model = VulnerableGroupData
    extra = 1


class AffectedGroupDataInline(admin.StackedInline):
    model = AffectedGroupData
    extra = 1


class EntryAdmin(admin.ModelAdmin):
    inlines = [VulnerableGroupDataInline, AffectedGroupDataInline]


admin.site.register(Country)
admin.site.register(Sector)
admin.site.register(VulnerableGroup)
admin.site.register(AffectedGroup)
admin.site.register(CrisisDriver)
admin.site.register(UnderlyingFactor)
admin.site.register(Entry, EntryAdmin)

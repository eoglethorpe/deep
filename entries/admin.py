from django.contrib import admin
from entries.models import *


class AdminLevelInline(admin.StackedInline):
    model = AdminLevel
    extra = 1


class CountryAdmin(admin.ModelAdmin):
    inlines = [AdminLevelInline]


class InformationSubpillarInline(admin.StackedInline):
    model = InformationSubpillar
    extra = 3


class InformationPillarAdmin(admin.ModelAdmin):
    inlines = [InformationSubpillarInline]


class SubsectorInline(admin.StackedInline):
    model = Subsector
    extra = 3


class SectorAdmin(admin.ModelAdmin):
    inlines = [SubsectorInline]


admin.site.register(Country, CountryAdmin)
admin.site.register(InformationPillar, InformationPillarAdmin)
admin.site.register(Sector, SectorAdmin)
admin.site.register(AffectedGroup)
admin.site.register(VulnerableGroup)
admin.site.register(SpecificNeedsGroup)

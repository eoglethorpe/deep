from django.contrib import admin
from entries.models import *


class AdminLevelInline(admin.StackedInline):
    model = AdminLevel
    extra = 1


class CountryAdmin(admin.ModelAdmin):
    inlines = [AdminLevelInline]


class InformationAttributeInline(admin.StackedInline):
    model = InformationAttribute
    extra = 3


class InformationAttributeGroupAdmin(admin.ModelAdmin):
    inlines = [InformationAttributeInline]


class AttributeDataInline(admin.StackedInline):
    model = AttributeData
    extra = 2


class EntryAdmin(admin.ModelAdmin):
    inlines = [AttributeDataInline]


admin.site.register(Country, CountryAdmin)
admin.site.register(Sector)
admin.site.register(AffectedGroup)
admin.site.register(VulnerableGroup)
admin.site.register(SpecificNeedsGroup)
admin.site.register(Entry, EntryAdmin)
admin.site.register(InformationAttributeGroup, InformationAttributeGroupAdmin)

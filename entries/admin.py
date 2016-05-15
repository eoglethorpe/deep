from django.contrib import admin
from entries.models import *


admin.site.register(Country)
admin.site.register(Sector)
admin.site.register(VulnerableGroup)
admin.site.register(AffectedGroup)
admin.site.register(CrisisDriver)
admin.site.register(UnderlyingFactor)
admin.site.register(Entry)

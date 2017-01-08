from django.core.management.base import BaseCommand, CommandError
from leads.models import *
from leads.views import get_simplified_lead


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        leads = Lead.objects.all()
        for lead in leads:
            try:
                simplified = SimplifiedLead.objects.get(lead=lead)
            except:
                print("Simplifying: {}".format(lead))
                context = {}
                get_simplified_lead(lead, context)
                if "lead_simplified" in context:
                    SimplifiedLead(lead=lead, text=context["lead_simplified"]).save()
                    print("Done")

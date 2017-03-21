from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from users.tests import login_user
from leads.tests import get_or_create_event
from leads.models import Lead
from django.conf import settings
from os.path import join as os_join


class LeadTestCase(TestCase):
    c = Client()

    def setUp(self):
        self.user = login_user(self)
        self.event = get_or_create_event(self.c, self.user)
        self.add_url = reverse('leads:add',
                               kwargs={'event': self.event.pk})
        self.list_url = reverse('leads:leads',
                                kwargs={'event': self.event.pk})
        self.basic_lead_data = {
                    'name': 'new_lead',
                    'source': 'some_source',
                    'event': self.event.pk,
                    'confidentiality': 'UNP',
                    'assigned-to': self.user.pk,
                    'publish-date': '2017-03-17',
                }

    def get_or_create_lead(self):
        self.setUp()
        lead = Lead.objects.all().first()
        if lead is None:
            self._lead_add_manual()
            lead = Lead.objects.all().first()
        return lead

    def _lead_add_url(self):
        # TODO: Add Attachement
        response = self.c.post(self.add_url,
                               {
                                'lead-type': 'website',
                                'url': 'https://reliefweb.int/report/'
                                       'afghanistan/iom-launches-displacement'
                                       '-tracking-afghanistan-humanitarian'
                                       '-crisis-looms',
                                'website': 'reliefweb.int',
                                **self.basic_lead_data
                               })
        self.assertEqual(response.status_code, 302,
                         "Leads Add URL POST :Failed")

    def _lead_add_manual(self):
        response = self.c.post(self.add_url,
                               {
                                'lead-type': 'manual',
                                'description': 'this is test',
                                **self.basic_lead_data
                               })
        self.assertEqual(response.status_code, 302,
                         "Leads Add Man POST :Failed")

    def _lead_add_attachment(self):
        for file_name in [
                os_join(settings.BASE_DIR, 'deep/tests_files/leads/doc.docx'),
                os_join(settings.BASE_DIR, 'deep/tests_files/leads/doc.pdf'),
                os_join(settings.BASE_DIR, 'deep/tests_files/leads/doc.pptx')
                ]:
            with open(file_name, 'rb') as fp:
                response = self.c.post(self.add_url,
                                       {
                                        **self.basic_lead_data,
                                        'lead-type': 'attachment',
                                        'file': fp,
                                       })
                self.assertEqual(response.status_code, 302,
                                 "Leads Add Att file: "+file_name +
                                 " POST :Failed")

    def _lead_list(self):
        response = self.c.get(self.list_url)
        self.assertEqual(response.status_code, 200, "Leads List GET :Failed")

    def test_lead_add_list(self):
        response = self.c.get(self.add_url)
        self.assertEqual(response.status_code, 200, "Leads Add GET :Failed")

        self._lead_add_url()
        self._lead_add_manual()
        self._lead_add_attachment()
        self._lead_list()

from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from users.tests import login_user
from leads.tests import get_or_create_event, LeadTestCase


class SOSTestCase(TestCase):
    c = Client()

    def setUp(self):
        self.user = login_user(self)
        self.event = get_or_create_event(self.c, self.user)
        self.lead = LeadTestCase().get_or_create_lead()
        self.add_url = reverse('leads:add_sos',
                               kwargs={'event': self.event.pk,
                                       'lead_id': self.lead.pk})
        self.list_url = reverse('leads:sos',
                                kwargs={'event': self.event.pk})

    def _sos_list(self):
        response = self.c.get(self.list_url)
        self.assertEqual(response.status_code, 200, "SOS List GET :Failed")

    def _sos_add(self):
        # TODO: Add SOS
        pass

    def test_lead_add_list(self):
        response = self.c.get(self.add_url)
        self.assertEqual(response.status_code, 200, "SOS Add GET :Failed")

        # self._sos_add()
        self._sos_list()

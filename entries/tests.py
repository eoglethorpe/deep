from django.core.urlresolvers import reverse
from leads.tests import get_or_create_event
from django.test import TestCase, Client
from users.tests import login_user


class EntryTestCase(TestCase):
    c = Client()

    def setUp(self):
        self.user = login_user(self)
        self.event = get_or_create_event(self.c, self.user)
        # self.add_url = reverse('entries:add',
        #                       kwargs={'event': self.event.pk})
        self.list_url = reverse('entries:entries',
                                kwargs={'event': self.event.pk})

    def _add_entry(self):
        # TODO: Add entry
        pass

    def _entry_list(self):
        response = self.c.get(self.list_url)
        self.assertEqual(response.status_code, 200, "Entry List GET :Failed")

    def test_entry_add_list(self):
        # response = self.c.get(self.add_url)
        # self.assertEqual(response.status_code, 200, "Entry Add GET :Failed")

        self._add_entry()
        self._entry_list()

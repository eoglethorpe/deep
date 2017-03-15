from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from leads.tests import get_or_create_event
from users.tests import login_user


class DeepTestCase(TestCase):
    """
    Basic Deep Test
    """
    c = Client()

    def setUp(self):
        self.user = login_user(self)

    def test_dashboard(self):
        response = self.c.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200,
                         "GET dashboard :Failed")

        event = get_or_create_event(self.c)
        response = self.c.get(reverse('dashboard',
                                      kwargs={'event': event.pk}))
        self.assertEqual(response.status_code, 200,
                         "GET dashboard with event :Failed")

from django.core.urlresolvers import reverse
from users.tests import login_user
from leads.models import Country, Event
from django.test import TestCase, Client
from users.tests import get_or_create_user


def get_or_create_event(client, admin=None, country=None):
    """
    Get or create crisis(or event or project in future) for Test Purpose
    client is required with logged in user as admin
    """
    event = Event.objects.all().first()
    if event is None:
        if country is None:
            country = get_or_create_country()
        if admin is None:
            admin = get_or_create_user(admin=True)
        client.post(reverse('custom_admin:crisis_panel'), {
                        'crisis-pk': 'new',
                        'crisis-name': 'test',
                        'crisis-status': 1,
                        'disaster-type': '',
                        'glide-number': 'OT-2017-000025-UGA',
                        'countries': country.code,
                        'crisis-start-date': '2017-03-08',
                        'crisis-end-date': '2017-12-29',
                        'admins': admin.pk,
                        'spillover': '',
                        'save': ''
                       }, follow=True)
        event = Event.objects.all().first()
        """
        self.assertNotEqual(response.redirect_chain[0][0],
                            reverse('custom_admin:crisis_panel'),
                            "Custom admin -> crisis panel POST(New) failed")
        """
    return event


def get_or_create_country():
    country = Country.objects.all().first()
    if country is None:
        country = Country()
        country.code = 'NPL'
        country.name = 'Nepal'
        country.save()
    return country


class EventTestCase(TestCase):
    c = Client()

    def setUp(self):
        self.user = login_user(self, admin=True)

    def test_event(self):
        """
        Test Country, Crisis(Event) registration
        """
        # New Country
        # TODO: Save country with POST method
        # reverse('custom-admin:country_management')

        country = get_or_create_country()

        response = self.c.get(reverse('custom_admin:crisis_panel'))
        self.assertEqual(response.status_code, 200,
                         "Custom admin -> crisis panel GET failed")

        # New Crisis
        get_or_create_event(self.c, self.user, country)

from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from users.models import User
from leads.models import Country, Event


class DeepTestCase(TestCase):
    """
    Basic Deep Test
    """
    c = Client()

    def _user(self):
        """
        Test Login, Registration for Users
        """
        # Check for login url
        response = self.c.get(reverse('login'))
        self.assertEqual(response.status_code, 200, "GET LOGIN")

        # Register user
        response = self.c.post(reverse('register'), {
                'first-name': 'Navin',
                'last-name': 'IR',
                'organization': 'ToggleCorp',
                'email': 'ayernavin@gmail.com',
                'password': 'navinir',
                're-password': 'navinir',
            })

        # Response is redirect to login
        self.assertEqual(response.status_code, 302,
                         "User Registration Failed")

        response = self.c.get(reverse('logout'))
        self.assertEqual(response.status_code, 302,
                         "User loggout failed")

        response = self.c.post(reverse('login'), {
                    'email': 'ayernavin@gmail.com',
                    'password': 'navinir'
                })
        self.assertEqual(response.status_code, 302,
                         "Login Failed")

        # Change user to Admin
        self.user = User.objects.get(email='ayernavin@gmail.com')
        self.assertIsNotNone(self.user, 'Registered User Not Found')
        self.user.is_admin = True
        self.user.save()

    def _crisis(self):
        """
        Test Country, Crisis(Event) registration
        """
        # New Country
        # TODO: Save country with POST method
        # reverse('custom-admin:country_management')
        country = Country()
        country.code = 'NPL'
        country.name = 'Nepal'
        country.save()

        response = self.c.get(reverse('custom_admin:crisis_panel'))
        self.assertEqual(response.status_code, 200,
                         "Custom admin > crisis panel GET failed")

        # New Crisis
        response = self.c.post(reverse('custom_admin:crisis_panel'),
                               {
                                'crisis-pk': 'new',
                                'crisis-name': 'test',
                                'crisis-status': 1,
                                'disaster-type': '',
                                'glide-number': 'OT-2017-000025-UGA',
                                'countries': 'NPL',
                                'crisis-start-date': '2017-03-08',
                                'crisis-end-date': '2017-12-29',
                                'admins': self.user.pk,
                                'spillover': '',
                                'save': ''
                               }, follow=True)
        """
        self.assertNotEqual(response.redirect_chain[0][0],
                            reverse('custom_admin:crisis_panel'),
                            "Custom admin > crisis panel POST(New) failed")
        """

    def setUp(self):
        self._user()
        self._crisis()

    def test_dashboard(self):
        response = self.c.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200,
                         "GET dashboard failed")

        crisis = Event.objects.all().first()
        self.assertIsNotNone(crisis, 'Registered Crisis(Event) Not Found')
        response = self.c.get(reverse('dashboard',
                                      kwargs={'event': crisis.pk}))
        self.assertEqual(response.status_code, 200,
                         "GET dashboard with event failed")

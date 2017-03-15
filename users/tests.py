from django.core.urlresolvers import reverse
from users.models import User, UserProfile
from django.test import TestCase, Client


def get_or_create_user(admin=False):
    """
    Get or create user for Test Purpose
    """
    user = User.objects.filter(is_superuser=admin).first()
    if user is None:
        first_name = 'Admin' if admin else 'Normal'
        last_name = 'admin' if admin else 'Person'
        email = 'admin@admin.com' if admin else 'normal@normal.com'

        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=email,
            email=email,
            password='thisispassword'
        )
        user.is_superuser = admin
        user.save()

        profile = UserProfile()
        profile.user = user
        profile.organization = 'Deep'
        profile.save()
    return user


def login_user(self, admin=False):
    """
    Login user for TestCase with client c
    """
    user = get_or_create_user(admin)
    response = self.c.get(reverse('logout'))
    response = self.c.post(reverse('login'), {
                    'email': user.email,
                    'password': 'thisispassword'
                })

    self.assertEqual(response.status_code, 302,
                     "User Login :Failed")
    return user


class UserTestCase(TestCase):
    c = Client()

    def test_user(self):
        """
        Test Login, Registration for Users
        """
        # Check for login url
        response = self.c.get(reverse('login'))
        self.assertEqual(response.status_code, 200, "GET LOGIN :Failed")

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
                         "User Registration :Failed")

        user = User.objects.get(email='ayernavin@gmail.com')
        self.assertIsNotNone(user, 'Just Registered User Not Found')

        response = self.c.get(reverse('logout'))
        self.assertEqual(response.status_code, 302,
                         "User loggout :Failed")

        # Login user
        response = self.c.post(reverse('login'), {
                    'email': 'ayernavin@gmail.com',
                    'password': 'navinir'
                })

        self.assertEqual(response.status_code, 302,
                         "User Login :Failed")

    def setUp(self):
        pass

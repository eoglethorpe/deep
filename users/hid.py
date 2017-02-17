from django.contrib.auth.models import User

from users.models import *

import requests


class HumanitarianId:
    def __init__(self, request):
        if "hid_access_token" not in request.session:
            self.status = False
            return

        access_token = request.session['hid_access_token']
        r = requests.get('https://auth.dev.humanitarian.id/account.json', params={'access_token': access_token})
        if r.status_code == 200:
            self.data = r.json()
            if self.data['active'] == 1 and self.data['email_verified']:
                self.status = True
            else:
                self.status = False
        else:
            self.status = False

    def save_user(self, profile):
        if not self.status:
            return

        user = profile.user
        user.first_name = self.data['name_given']
        user.last_name = self.data['name_family']
        # profile.organization =  TODO
        user.save()
        profile.save()

    def create_user(self):
        if not self.status:
            return None, None

        username = 'hid_user_' + self.data['id']
        password = self.data['id']

        user = User.objects.create_user(
            first_name=self.data['name_given'],
            last_name=self.data['name_family'],
            username=username,
            password=password
        )
        user.save()

        profile = UserProfile()
        profile.user = user
        profile.hid = self.data['user_id']
        profile.save()

        return username, password

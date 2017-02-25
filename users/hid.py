from django.contrib.auth.models import User

from deep.settings import BASE_DIR
from users.models import *

import requests
import configparser
import os


class HumanitarianId:
    def __init__(self, request):
        if "hid_access_token" not in request.session:
            self.status = False
            return

        config = HidConfig()
        if not config.client_id:
            self.status = False
            return

        access_token = request.session['hid_access_token']

        if config.development:
            url = 'https://auth.dev.humanitarian.id/account.json'
        else:
            url = 'https://auth.humanitarian.id/account.json'

        r = requests.get(url, params={'access_token': access_token})
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
        user.email = self.data['email']
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
            email=self.data['email'],
            username=username,
            password=password
        )
        user.save()

        profile = UserProfile()
        profile.user = user
        profile.hid = self.data['user_id']
        profile.save()

        return username, password


class HidConfig:
    def __init__(self):
        self.config = configparser.ConfigParser()
        self.config.read(os.path.join(BASE_DIR, 'hid.cnf'))
        if 'client' in self.config:
            self.client_id = self.config['client']['client_id']
            self.client_name = self.config['client']['client_name']
            self.development = self.config['client']['development'] == 'True'
            self.redirect_url = self.config['client']['redirect_url']

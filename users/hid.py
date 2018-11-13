from django.contrib.auth.models import User

from deep.settings import BASE_DIR
from users.models import *

import requests
import configparser
import os


class HumanitarianId:
    def __init__(self, request):
        if "hid_token" not in request.session or "hid_user" not in request.session:
            self.status = False
            return

        config = HidConfig()
        if not config.client_id:
            self.status = False
            return

        token = request.session['hid_token']
        user_id = request.session['hid_user']

        if not token or not user_id:
            self.status = False
            return

        if config.development:
            url = 'https://api2.dev.humanitarian.id/api/v2/user/' + user_id
        else:
            url = 'https://auth.humanitarian.id/api/v2/user/' + user_id

        r = requests.get(url, headers={'Authorization': 'Bearer ' + token})
        if r.status_code == 200:
            self.data = r.json()
            if self.data['email_verified'] and not self.data['deleted']:
                self.status = True
            else:
                self.status = False
        else:
            self.status = False

    def save_user(self, profile):
        if not self.status:
            return

        user = profile.user
        user.first_name = self.data['given_name']
        user.last_name = self.data['family_name']
        user.email = self.data['email']
        # profile.organization =  TODO
        user.save()
        profile.save()

    def create_user(self):
        if not self.status:
            return None, None

        username = 'hid_user_' + self.data['user_id']
        password = self.data['user_id']

        user = User.objects.create_user(
            first_name=self.data['given_name'],
            last_name=self.data['family_name'],
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

    @staticmethod
    def get_token_and_user_id(access_token):
        config = HidConfig()
        if config.client_id:
            if config.development:
                url = 'https://api2.dev.humanitarian.id/account.json'
            else:
                url = 'https://auth.humanitarian.id/account.json'

            r = requests.post(
                url,
                headers={'Authorization': 'Bearer ' + access_token},
            )
            if r.status_code == 200:
                data = r.json()
                return access_token, data['_id']
            else:
                print(r.json())
        return None, None



class HidConfig:
    def __init__(self):
        self.config = configparser.ConfigParser()
        self.config.read(os.path.join(BASE_DIR, 'hid.cnf'))
        if 'client' in self.config:
            self.client_id = self.config['client']['client_id']
            self.client_name = self.config['client']['client_name']
            self.development = self.config['client']['development'] == 'True'
            self.redirect_url = self.config['client']['redirect_url']

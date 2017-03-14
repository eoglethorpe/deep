#! /bin/bash

. /home/code/venv/bin/activate
python /home/code/deep/manage.py migrate --noinput
#TODO: Define static directory to docker volumn in settings and use django's collectstatic
#TODO: Define media directory to docker volumn in settings
/home/code/venv/bin/uwsgi --ini /home/code/deep/deploy/django/uwsgi.ini

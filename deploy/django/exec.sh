#! /bin/bash

service remote_syslog start # start remote_syslog for papaertail log collecter
. /home/code/venv/bin/activate # Activate python env

## deep init
# collect static files and database migrations
#python ./deep/manage.py migrate --noinput
#python ./deep/manage.py collectstatic --noinput

# load admin data and files
#python ./deep/manage.py load_admin0
#python ./deep/manage.py load_admin1
#python ./deep/manage.py load_admin2

#python3 ./deep/manage.py backup_apis # run for new static bucket

/home/code/venv/bin/uwsgi --ini /home/code/deep/deploy/django/uwsgi.ini # Start uwsgi server


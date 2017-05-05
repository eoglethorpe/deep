#! /bin/bash

. /home/code/venv/bin/activate
python /home/code/deep/manage.py migrate --noinput
python /home/code/deep/manage.py collectstatic --noinput

python /home/code/deep/manage.py load_admin0
python /home/code/deep/manage.py load_admin1
python /home/code/deep/manage.py load_admin2

/home/code/venv/bin/uwsgi --ini /home/code/deep/deploy/django/uwsgi.ini


#! /bin/bash

. /home/code/venv/bin/activate
python /home/code/deep/manage.py migrate
/home/code/venv/bin/uwsgi --ini /home/code/uwsgi.ini &
service nginx start

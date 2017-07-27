#!/bin/bash
# This script needs to be run after each docker image update on ebs

. /home/code/venv/bin/activate

python3 /home/code/deep/manage.py migrate --no-input
python3 /home/code/deep/manage.py collectstatic --no-input

#! /bin/bash

##### For Docker Image

# Setup venv
pip3 install virtualenv
virtualenv venv

# Install DEEP reqs
. ./venv/bin/activate
pip install -U pip
pip install -U --upgrade pip
pip install -U appdirs uwsgi setuptools
pip install -r ./deep/requirements.txt --upgrade

# Add user ubuntu
useradd -ms /bin/bash ubuntu

# Install remote2_syslog for logging
curl -L -o /tmp/syslog2 "https://github.com/papertrail/remote_syslog2/releases/download/v0.19/remote-syslog2_0.19_amd64.deb"
dpkg -i /tmp/syslog2
rm /tmp/syslog2

# Download remote2_syslog init
curl -L -o /etc/init/remote_syslog.conf "https://raw.githubusercontent.com/papertrail/remote_syslog2/master/examples/remote_syslog.upstart.conf"
curl -L -o /etc/init.d/remote_syslog "https://raw.githubusercontent.com/papertrail/remote_syslog2/master/examples/remote_syslog.init.d"
chmod +x /etc/init.d/remote_syslog
update-rc.d remote_syslog defaults

mkdir /var/log/uwsgi

# Add Cloud Watch metrics
curl http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip -O
unzip CloudWatchMonitoringScripts-1.2.1.zip

# Add cronjobs
touch /var/log/cron.log
crontab ./deep/cronjobs

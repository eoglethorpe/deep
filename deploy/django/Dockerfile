# Copyright 2013 Thatcher Peskens
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#modified from: https://github.com/dockerfiles/django-uwsgi-nginx

FROM ubuntu:16.04

MAINTAINER togglecorp

# Install required packages and remove the apt packages cache when done.

## General system

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
	vim \
	git \
	python3 \
	python3-dev \
	python3-setuptools \
	python3-pip \
	uwsgi-plugin-python3 \
	supervisor \
	sqlite3 \
	curl \

        #DEEP specifc
        libjpeg-dev \
        libmysqlclient-dev &&\

   rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/code/deep
WORKDIR /home/code/

#RUN mkdir /root/.ssh/
#COPY id_rsa /root/.ssh/id_rsa
#RUN chmod 600 /root/.ssh/id_rsa
#RUN eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_rsa
#RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
#RUN git clone -b dockertest git@github.com:eoglethorpe/deep.git

# Copy deep code
COPY ./ ./deep

# Run init script
RUN chmod +x ./deep/deploy/django/init.sh &&\
    ./deep/deploy/django/init.sh

# Setup all the configfiles
COPY ./deploy/django/mysql.cnf ./deep/mysql.cnf

# Remote_syslog config file
COPY ./deploy/django/log_files.yml /etc/log_files.yml

# Expose port 80
EXPOSE 80

# Start deep django server and log collector
CMD chmod +x ./deep/deploy/django/exec.sh &&\
    ./deep/deploy/django/exec.sh

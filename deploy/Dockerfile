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

ARG ALLOWED_HOST
ENV ALLOWED_HOST $ALLOWED_HOST

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
	nginx \
	supervisor \
	sqlite3 \

        #DEEP specifc
        libjpeg-dev \
        libmysqlclient-dev &&\

   rm -rf /var/lib/apt/lists/*

# Make code dir and get code 

## we add ARG SHA for git pull workaround to only pull for new commits
ARG SHA
RUN mkdir /home/code/
WORKDIR /home/code/

RUN mkdir /root/.ssh/
COPY id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

RUN git clone -b dockertest git@github.com:eoglethorpe/deep.git 

# Setup venv
RUN pip3 install virtualenv
RUN virtualenv venv 

# Install DEEP reqs
RUN . /home/code/venv/bin/activate && pip install -U pip
RUN . /home/code/venv/bin/activate && pip install -U appdirs uwsgi setuptools && pip install -r deep/requirements.txt --upgrade


# Setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN cp deep/deploy/nginx-app.conf /etc/nginx/sites-available/default
COPY mysql.cnf /home/code/deep/mysql.cnf

RUN useradd -ms /bin/bash ubuntu

EXPOSE 80
CMD ["chmod", "+x", "/home/code/deep/deploy/exec.sh"]

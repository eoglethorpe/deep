# TODO: Use nginx image
FROM ubuntu:16.04

MAINTAINER togglecorp


RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y nginx wget

# Setup configfiles for nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

COPY nginx-app.conf /etc/nginx/sites-available/default

RUN wget -O /tmp/syslog2 "https://github.com/papertrail/remote_syslog2/releases/download/v0.19/remote-syslog2_0.19_amd64.deb" && \
    dpkg -i /tmp/syslog2 && \
    rm /tmp/syslog2

RUN wget -O /etc/init/remote_syslog.conf "https://raw.githubusercontent.com/papertrail/remote_syslog2/master/examples/remote_syslog.upstart.conf" && \
    wget -O /etc/init.d/remote_syslog "https://raw.githubusercontent.com/papertrail/remote_syslog2/master/examples/remote_syslog.init.d" && \
    chmod +x /etc/init.d/remote_syslog && \
    update-rc.d remote_syslog defaults

# Remote_syslog config file
COPY log_files.yml /etc/log_files.yml

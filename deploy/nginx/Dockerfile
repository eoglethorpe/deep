# TODO: Use nginx image
FROM ubuntu:16.04

MAINTAINER togglecorp


RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y nginx

# Setup configfiles for nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

COPY nginx-app.conf /etc/nginx/sites-available/default

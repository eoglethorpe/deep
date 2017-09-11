[![Build Status](https://travis-ci.org/eoglethorpe/deep.svg?branch=master-docker)](https://travis-ci.org/eoglethorpe/deep)

# Data Entry and Exploration Platform

DEEP is a humanitarian tool to collect and analyze secondary data from various publications such as websites and PDF reports. 

## Public API

Data collected by DEEP is currently publicly available. Read the [documents](https://github.com/eoglethorpe/deep/blob/master/API.md) for details on how to use it.

## Deployment
Note: deployment logic is changing and what is below most likely won't work. Contact oglethorpe.ewan@gmail.com if you would like to deploy your own DEEP.


### Requirements

* Python >= 3.4
* Django >= 1.9

### Installation

First setup a virtual environment.

```bash
$ sudo apt-get install python3.4-venv
$ virtualenv ~/deepenv
$ . ~/deepenv/bin/activate
```

Install missing packages.

```bash
$ apt-get install libjpeg-dev libmysqlclient-dev
```

Copy or clone the project to a directory and cd into it.

Next you can use ```setup.py``` or ```pip``` to install remaining dependancies:

```bash
$ python setup.py install
or
$ pip install -r requirements.txt
```



### Migration

A MySQL database is required to use DEEP. Create one if it doesn't exist.

Create a file 'mysql.cnf' and enter the database details as follows:

```
[client]
database = DATABASE_NAME
host = localhost
user = USERNAME
password = PASSWORD
default-character-set = utf8
```

Migrate all database schema changes:

```bash
$ python manage.py migrate
```

### Test

Test run the web server:

```bash
$ python manage.py runserver
```

By default, the server should run at `localhost:8000`. Test the website locally by browsing to this address.

The website is then ready to be deployed.

## Chrome Extension

### Installation
[Chrome Store](https://chrome.google.com/webstore/detail/deep-create-lead/eolekcokhpndiemngdnnicfmgehdgplp/)

You can open the *options* page of the extension, to change server url and read usage guide.

## Docker

### Installation
> Install Docker
- [For Ubuntu](https://docs.docker.com/engine/installation/linux/ubuntu/#install-from-a-package)

> Login to DockerHub

```bash
$ docker login
```
> You can build and push Deep Docker image [replace `1.1-dev` with required version]:

```bash
$ docker build --tag eoglethorpe/deep:1.1-dev . # build image
$ docker push eoglethorpe/deep:1.1-dev # push image to dockerhub
```

> To Build and run locally [replace `deep-dev` with required name and `eoglethorpe/deep:1.1-dev` with
  required image name]

```bash
$ docker build --tag eoglethorpe/deep:1.1-dev . # replace 1.1-dev with required version. build image

$ docker run -d -e ALLOWED_HOST='localhost' -p 8080:80 --name deep-dev eoglethorpe/deep:1.1-dev # run container

$ docker run -d -e ALLOWED_HOST='localhost' \
    -e USE_S3='True' \ # With s3 for static and media
    -e AWS_STORAGE_BUCKET_NAME='bucket-name' \
    -e AWS_ACCESS_KEY_ID='a-key' \
    -e AWS_SECRET_ACCESS_KEY='s-key' \
    -p 8080:80 \
    --name deep-dev eoglethorpe/deep:1.1-dev

$ docker stop deep-dev # to stop container
$ docker rm deep-dev # to remove container
```

### Deploy into EBS
```
./deploy/deploy_to_eb.sh .env-dev # Replace .env with you env file [Sample .env-sample]
```

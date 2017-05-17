# Data Entry and Exploration Platform

DEEP is a humanitarian tool to collect and analyze information from various publications and sources pertaining to events happening in different countries. It is meant to help the analysts easily generate reports of various events of the world.

## Public API

Data collected by DEEP is currently publicly available. Read the [documents](https://github.com/eoglethorpe/deep/blob/master/API.md) for details on how to use it.

## Deployment

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

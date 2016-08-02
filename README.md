# Data Entry and Extraction Platform

TODO

## API

TODO

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

Next run ```setup.py``` to install remaining dependancies:

```bash
$ python setup.py install
```



### Migration

You need a mysql database. Create one if it doesn't exist.

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

### Deploying with uwsgi and nginx

TODO

## Chrome Extension

### Installation
[Chrome Store](https://chrome.google.com/webstore/detail/deep-create-lead/eolekcokhpndiemngdnnicfmgehdgplp/)

### Usage
Open the extension while browsing the page, fill out the required inputs and submit.

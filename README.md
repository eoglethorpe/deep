# Data Entry and Extraction Platform

TODO

## API

TODO

## Deployment

### Requirements

* Python >= 3.4
* Django >= 1.9

### Installation

First setup a virtual environment with Django.

```bash
$ sudo apt-get install python3.4-venv
$ virtualenv ~/deepenv
$ source ~/deepenv/bin/activate
$ pip install django
```

Also install Django REST Framework.

```bash
$ pip install djangorestframework
```

Next copy or clone the project to some directory.

For using mysql, you need to install mysqlclient.

```bash
$ sudo apt-get install libmysqlclient-dev
$ pip install mysqlclient
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

### Load
1. Go to Settings > Extensions.
2. Check "Developer mode".
3. Hit "Load unpacked extension..." button.
4. Navigate to the Repo directory and select "chrome-extension"

### Usage
Open the extension while browsing the page, fill out the required inputs and submit.

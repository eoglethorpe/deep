# Data Entry and Extraction Platform

TODO

## API

TODO

## Deployment

### Requirements

* Python >= 3.4
* Django >= 1.9

### Installation

First setup a virtual environment with django.

```bash
$ sudo apt-get install python3.4-venv
$ virtualenv ~/deepenv
$ source ~/deepenv/bin/activate
$ pip install django
```

Next copy or clone the project to some directory.

### Migration

Migrate all database schema changes:

```bash
$ python manage.py migrate
```

This basically creates the database if doesn't already exists and migrate all changes if it does but is not up-to-date.

### Test

Test run the web server:

```bash
$ python manage.py runserver
```

By default, the server should run at `localhost:8000`. Test the website locally by browsing to this address.

### Deploying with uwsgi and nginx

TODO

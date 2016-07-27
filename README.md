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

Also install the Readability and PDFMiner modules for stripping text from web and pdf documents and MS Office packages.

```bash
$ sudo apt-get install libxml2-dev libxslt-dev
$ pip install readability-lxml
$ pip install requests
$ pip install pdfminer3k
$ pip install openpyxl
$ pip install docx
```

Next copy or clone the project to some directory.

### Migration

Migrate all database schema changes:

```bash
$ python manage.py migrate
```

This creates the database if it doesn't exist and introduce all changes since last migration if does.

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

# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-02 16:13
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entries', '0003_auto_20160801_1357'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='vulnerablegroup',
            options={'ordering': ['min_age', 'max_age']},
        ),
    ]

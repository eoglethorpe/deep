# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-08-09 07:36
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entries', '0043_auto_20170806_0905'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='adminlevelselection',
            unique_together=set([]),
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-21 08:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0002_auto_20161108_0908'),
    ]

    operations = [
        migrations.RenameField(
            model_name='weeklyreport',
            old_name='last_edtied_at',
            new_name='last_edited_at',
        ),
    ]
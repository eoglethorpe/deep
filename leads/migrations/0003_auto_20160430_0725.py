# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-30 07:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0002_auto_20160430_0513'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lead',
            name='published_at',
            field=models.DateField(blank=True, null=True),
        ),
    ]

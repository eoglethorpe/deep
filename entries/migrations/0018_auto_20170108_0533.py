# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-01-08 05:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entries', '0017_auto_20161211_0449'),
    ]

    operations = [
        migrations.AddField(
            model_name='informationpillar',
            name='tooltip',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='informationsubpillar',
            name='tooltip',
            field=models.TextField(blank=True, default=''),
        ),
    ]

"""
data extraction methods - currently only for entries
"""

import csv
import pickle
import os
import json

import argparse
import boto

from entries.models import Entry
from django.core.management.base import BaseCommand

class Ent(object):
    def __init__(self):
        self.onedim = None
        self.twodim = None
        self.reliability = None
        self.severity = None
        self.demo_groups = None
        self.specific_needs = None
        self.affected_groups = None
        self.geo_locations = None
        self.information_date = None
        self.excerpt = None
        self.has_image = None
        self.lead_text = None
        self.lead_id = None
        self.lead_url = None
        self.event = None

    def add_onedim(self, info_att):
        pill_nm = info_att.subpillar.pillar.name
        subpill_nm = info_att.subpillar.name

        if not self.onedim:
            self.onedim = {}

        if pill_nm not in self.onedim:
            self.onedim[pill_nm] = [subpill_nm]
        else:
            self.onedim[pill_nm].append(subpill_nm)

    def add_twodim(self, info_att):
        if not self.twodim:
            self.twodim = []

        tddict = {'pillar': None, 'subpillar': None, 'sector': None, 'subsectors': None}

        tddict['sector'] = info_att.sector.name
        tddict['pillar'] = info_att.subpillar.pillar.name
        tddict['subpillar'] = info_att.subpillar.name
        if len(info_att.subsectors.all()) > 0:
            tddict['subsectors'] = [sub.name for sub in info_att.subsectors.all()]

        self.twodim.append(tddict)

    def get_head(self):
        return ['onedim_j', 'twodim_j', 'reliability', 'severity', 'demo_groups_j', 'specific_needs_j',
                'aff_groups_j', 'geo_j', 'info_date', 'excerpt', 'has_image', 'lead_text', 'lead_id', 'lead_url', 'event']

    def get_row(self):
        return [str(val) for val in [json.dumps(self.onedim), json.dumps(self.twodim), self.reliability, self.severity, json.dumps(self.demo_groups),
                                     json.dumps(self.specific_needs), json.dumps(self.affected_groups), json.dumps(self.geo_locations),
                                     self.information_date, self.excerpt, self.has_image, self.lead_text, self.lead_id,
                                     self.lead_url, self.event]]

def extract_entries():
    """
    grab entries data from DEEP

    ----

    context: list
    population profile: list
    communication: list
    humanitarian access: list
    sector, pillar + subpillar: dict w/ lists... {sector: [subsect]...}
    reliability: int
    severity: int
    demo groups: list
    specific needs: list
    affected groups: list
    geo locations: list (blank for now)
    subsector: dict w/ lists... {sector: [subsect]...}
    information date: date
    excerpt: string
    has_image: T/F
    lead: int
    """

    deep_ents = []

    for cnt, ent_it in enumerate(Entry.objects.all()):

        # pillar/subpillar/subsector. if just top row, second two are None

        # context, population, communication, humanitarian access, pillar/subpillar
        for subent in ent_it.entryinformation_set.all():
            cent = Ent()

            for info_att in subent.informationattribute_set.all():
                # pillar/subpillar
                if info_att.sector:
                    cent.add_twodim(info_att)

                # context, population, communication, humanitarian access
                else:
                    cent.add_onedim(info_att)

            # reliability
            if subent.reliability:
                cent.reliability = subent.reliability.name

            # severity
            if subent.severity:
                cent.severity = subent.severity.name

            # demograhpic groups
            if len(subent.vulnerable_groups.all()) > 0:
                cent.demo_groups = [n.name for n in subent.vulnerable_groups.all()]

            # specific
            if len(subent.specific_needs_groups.all()) > 0:
                cent.specific_needs = [n.name for n in subent.specific_needs_groups.all()]

            # affected
            if len(subent.affected_groups.all()) > 0:
                cent.affected_groups = [g.name for g in subent.affected_groups.all()]

            # geo - none for now

            # information date
            cent.information_date = subent.date

            # excerpt
            cent.excerpt = subent.excerpt

            # has_image
            cent.has_image = subent.image == ''

            # lead id
            cent.lead_id = ent_it.lead_id

            # lead content (passed for now to save space)
            # cent.lead = ent_it.lead.simplifiedlead.text

            # lead URL
            cent.lead_url = ent_it.lead.url

            # event
            cent.event = ent_it.lead.event.name

            deep_ents.append(cent)

            if cnt % 100 == 0:
                print('{} entries parsed'.format(cnt))

    return deep_ents


def send_boto(tmp):
    conn = boto.connect_s3(os.environ['AWS_ACCESS_KEY_ID'], os.environ['AWS_SECRET_ACCESS_KEY'])

    bucket = conn.get_bucket('deepnlp')
    key = boto.s3.key.Key(bucket)
    key.key = 'nlp_out.csv'
    key.set_contents_from_filename(tmp)


class Command(BaseCommand):

    parser = argparse.ArgumentParser(description='Data extraction')
    parser.add_argument('entries', metavar='N', type=bool, nargs='+',
                        help='Extract just entries?')

    def handle(self, *args, **kwargs):
        prepare_to_get_ricked = extract_entries()

        filename = '/tmp/tmp_nlp%s.csv' % os.getpid()

        with open(filename, 'w') as fp:
            writer = csv.writer(fp, delimiter=',')

            first = True
            for ent in prepare_to_get_ricked:
                if first:
                    writer.writerow(ent.get_head())
                    first = False

                writer.writerow(ent.get_row())

        try:
            send_boto(filename)
        finally:
            os.remove(filename)
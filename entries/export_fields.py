"""collection of methods to gather fields for xls, docx and any other sources"""
import time
from collections import OrderedDict

from entries.models import *

def get_file_name(t):
    if t == 'xls':
        post = '.xlsx'
    elif t == 'doc':
        post = '.docx'
    else:
        post = ''

    return '%s DEEP Export%s' % (time.strftime("%Y-%m-%d"), post)

def get_aff(e):
    return ', '.join([v.name for v in e.affected_groups.all()])

def get_created_at(e):
    return "{0:%b %d %Y %I:%M%p}".format(e.created_at)

def get_created_by(e):
    return e.created_by.username

def get_lead(e):
    return e.lead.name

def get_geo(e):
    return ', '.join(['{name} ({type}, {country})'.format(name = s.name, type = s.admin_level.name, \
                                                country = s.admin_level.country) for s in e.map_selections.all()])
def get_vuln(e):
    return ', '.join([g.__str__() for g in e.vulnerable_groups.all()])

def get_specific(e):
    return ', '.join([g.__str__() for g in e.specific_needs_groups.all()])

def get_event(e):
    """used to include the event object itself in gen_base_vals()"""
    return e

def gen_base_vals():
    """which columns should be included and which function is used to create them"""
    return OrderedDict([
            ('Created At' , 'get_created_at'),
            ('Created By' , 'get_created_by'),
            ('Lead' , 'get_lead'),
            ('Vulnerable Groups' , 'get_vuln'),
            ('Specific Needs Groups' , 'get_specific'),
            ('Affected Groups' , 'get_aff'),
            ('Map Selections' , 'get_geo'),
            ('evt_obj', 'get_event')])

def gen_ia_names(ents):
    """figure out which IAs are present in all entries and generate respecitve cols
            returns an ordereddict of lists {Attribute : [cols]}"""
    ret = OrderedDict()
    for e in ents:
        for ad in e.attributedata_set.all():
            an = ad.attribute.name
            ret[ad.attribute] = [
                '%s Excerpt' % an,
                '%s Num' % an,
                '%s Severity' % an,
                '%s Reliability' % an
                ]

    return ret

#TODO: needs to be fixed to work better with docx (ie not return just list)

def gen_ias(ents, e):
    """Generate IAs for a specifc entry"""

    #initialize all values to be blank
    att_cols = OrderedDict(((v, '') for v in (sum(gen_ia_names(ents).values(), []))))
    atts = gen_ia_names(ents).keys()

    for att in [v for v in e.attributedata_set.all()]:
        if att.attribute in atts:
            an = att.attribute.name
            att_cols['%s excerpt' % an] = att.excerpt
            att_cols['%s number' % an] = att.number
            att_cols['%s severity' % an] = att.get_severity_display()
            att_cols['%s reliability' % an] = att.get_reliability_display()

    return att_cols

def gen_ias_xls(ents,e):
    """Generate IAs for a given entry in a list that spans all entries
        ie list is tailored for xls"""

    return list(gen_ias(ents,e).values())


def get_aff_fancy(e):
    #Not in use, can be used to prettify inputs, still needs work
    #Output: (if category exists)... Non-Affected  | Disp: g1, g2 | Non Displaced: g1, g2
    ags = [v for v in e.affected_groups.all()]
    ret = ''

    if AffectedGroup('Non Affected') in ags:
        ret += 'Non Affected'
    for v in AffectedGroup('Displaced'), AffectedGroup('Non Displaced'):
        if v in ags:
            if len(ret) > 0:
                ret += ' | '
            ret += v.name

            sl = [g.name for g in ags if g in v.affectedgroup_set.all()]
            if len(sl) > 0:
                ret += ': '
                ret += ', '.join(sl)

    return ret

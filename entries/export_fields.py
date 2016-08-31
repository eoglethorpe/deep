"""collection of methods to gather fields for xls, docx and any other sources"""
import time
from collections import OrderedDict
from re import sub

from entries.models import *

def get_file_name(t):
    if t == 'xls':
        post = '.xlsx'
    elif t == 'doc':
        post = '.docx'
    else:
        post = ''

    return '%s DEEP Export%s' % (time.strftime("%Y-%m-%d"), post)

def get_admn_lvl1(e):
    return [v.name for v in e.map_selections.all() if v.admin_level_id == 1]

def get_admn_lvl2(e):
    return [v.name for v in e.map_selections.all() if v.admin_level_id == 2]

def get_admn_lvl3(e):
    return [v.name for v in e.map_selections.all() if v.admin_level_id == 3]

def get_admn_lvl4(e):
    return [v.name for v in e.map_selections.all() if v.admin_level_id == 4]

def get_admn_lvl5(e):
    return [v.name for v in e.map_selections.all() if v.admin_level_id == 5]

def get_aff_all(e):
    return [v.name for v in e.affected_groups.all()]

def get_aff_lvl1(e):
    grps = ['Affected', 'Non Affected']
    return [v.name for v in e.affected_groups.all() if v.name in grps]

def get_aff_lvl2(e):
    grps = ['Displaced', 'Non Displaced']
    return [v.name for v in e.affected_groups.all() if v.name in grps]

def get_aff_lvl3(e):
    grps = ['IDP', 'Others of Concern', 'Refugees and Asylum Seekers', 'Returnees', 'Host', 'Non-Host']
    return [v.name for v in e.affected_groups.all() if v.name in grps]

def get_source(e):
    return e.lead.source_id

def get_lead_id(*args):
    id = '0'*(3-len(str(args[0].lead_id))) + str(args[0].lead_id)
    return 'lead' + id

def get_entry_id(*args):
    id = '0'*(3-len(str(args[0].id))) + str(args[0].id)
    return 'entry' + id

def get_tag_id(*args):
    id = '0'*(3-len(str(args[1].pk))) + str(args[1].pk)
    return 'tag' + id
def get_confidentiality(e):
    return e.lead.get_confidentiality_display()

def get_crisis(e):
    return e.lead.event.name

def get_lead_url(e):
    return e.lead.url

def get_lead_created_at_dt(e):
    return "{0:%b %d %Y}".format(e.lead.created_at)

def get_lead_created_at(e):
    return "{0:%b %d %Y %I:%M%p}".format(e.lead.created_at)

def get_ent_created_at(e):
    return "{0:%b %d %Y %I:%M%p}".format(e.created_at)

def get_created_by(e):
    return e.created_by.username

def get_lead(e):
    return e.lead.name

def get_geo_list(e):
    """get a dict of map selections divided by admin level"""
    return ', '.join(['{name} ({type}, {country})'.format(name = s.name, type = s.admin_level.name, \
                                                 country = s.admin_level.country) for s in e.map_selections.all()])

def get_geo_dict(e):
    """get a dict of map selections divided by admin level"""
    l = [(int(p.admin_level.id), p.name) for p in e.map_selections.all()]
    l.sort(key=lambda t : t[0])

    d = OrderedDict()
    for x, y in l:
        d.setdefault('Admin ' + str(x), []).append(y)

    for v in d.values():
        v.sort()

    print(d)
    return d

def get_vuln(e):
    return [g.__str__() for g in e.vulnerable_groups.all()]

def get_specific(e):
    return [g.__str__() for g in e.specific_needs_groups.all()]

def get_event(e):
    """used to include the event object itself in gen_base_vals()"""
    return e

def get_countries(e):
    return list(set([v.admin_level.country.name for v in e.map_selections.all()]))

def get_ia_lvl1(att):
    return att.attribute.group.name

def get_ia_lvl2(att):
    return att.attribute.name

def get_ia_exc(att):
    """return excerpt with new lines removed at start and end"""
    return sub('^(\\n)*|(\\n)*$', '', att.excerpt)

def get_ia_num(att):
    return att.number

def get_ia_rel(att):
    return att.get_reliability_display()

def get_ia_sev(att):
    return att.get_severity_display()

def gen_ia_names(ents):
    """figure out which IAs are present in all entries and generate respecitve cols
            returns an ordereddict of lists {Attribute : [cols]}"""
    ret = OrderedDict()
    for e in ents:
        for ad in e.attributedata_set.all():
            an = ad.attribute.name
            ret[ad.attribute] = [
                '%s excerpt' % an,
                '%s number' % an,
                '%s serverity' % an,
                '%s reliability' % an
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
            att_cols['%s excerpt' % an] = get_ia_exc(att)
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

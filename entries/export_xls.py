"""exporting entries to xlsx"""
from collections import OrderedDict
import time

from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook
from openpyxl.styles import Font, Alignment

from entries.models import *

EXPORT_TAB = 'DEEP Export | Entries'
META_TAB =  'Metadata'

def _expand_cols(wb):
    """expand all column dims to match max length"""
    for sht in wb.worksheets:
        dims = {}
        for row in sht.rows:
            for cell in row:
                if cell.value:
                    try:
                        dims[cell.column] = min(max((dims.get(cell.column, 0), len(str(cell.value)))), 100)
                        c = cell
                    except:
                        dims[cell.column] = min(max((dims.get(cell.column, 0), len(cell.value))), 100)
                        c = cell
                    finally:
                        cell.alignment = Alignment(wrap_text=True, vertical='top')

        for col, value in dims.items():
            sht.column_dimensions[col].width = value

def init_xls():
    #initialize Workbook and activie sheet
    wb = Workbook()
    wb.remove_sheet(wb.get_sheet_by_name('Sheet'))
    wb.create_sheet(EXPORT_TAB, 0)
    wb.create_sheet(META_TAB)

    return wb

def gen_meta(sht):
    """return a sheet with metadata info on export"""
    sht.append(['Export Information'])
    sht.append(['Date', time.strftime("%Y-%m-%d at %H:%M")])
    sht.append(['Number of entries', len(Entry.objects.all())])

    _make_bold(sht.rows[0])

def _make_bold(cells):
    """make a list of cells bold"""
    for c in cells:
        c.font = Font(bold = True)



def _get_aff_fancy(e):
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

def _get_aff(e):
    return ', '.join([v.name for v in e.affected_groups.all()])

def _get_created_at(e):
    return "{0:%b %d %Y %I:%M%p}".format(e.created_at)

def _get_created_by(e):
    return e.created_by.username

def _get_lead(e):
    return e.lead.name

def _get_geo(e):
    return ', '.join(['{name} ({type}, {country})'.format(name = s.name, type = s.admin_level.name, \
                                                country = s.admin_level.country) for s in e.map_selections.all()])
def _get_vuln(e):
    return ', '.join([g.__str__() for g in e.vulnerable_groups.all()])

def _get_specific(e):
    return ', '.join([g.__str__() for g in e.specific_needs_groups.all()])

def _mk_col_nm(cn):
    return cn.replace(' ', '_').lower()

def _mk_col_nm_lst(cl):
    return [cn.replace(' ', '_').lower() for cn in cl]

# def _gen_ia_cols_spec(ents):
#     """generate ia cols for a specific attribute"""


def _gen_ia_cols(ents):
    """figure out which IAs are present in entries and generate respecitve cols
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

def _gen_base_cols():
    """which additional columns (IAs) should be included"""
    return OrderedDict([
            ('Created At' , '_get_created_at'),
            ('Created By' , '_get_created_by'),
            ('Lead' , '_get_lead'),
            ('Vulnerable Groups' , '_get_vuln'),
            ('Specific Needs Groups' , '_get_specific'),
            ('Affected Groups' , '_get_aff'),
            ('Map Selections' , '_get_geo')])

def _ins_ias(ents, e):
    """create ias row for a given entry"""
    ret = []

    #initialize all values to be blank
    #TODO one line
    att_cols = OrderedDict(((v, '') for v in _mk_col_nm_lst(sum(_gen_ia_cols(ents).values(), []))))
    atts = _gen_ia_cols(ents).keys()

    for att in [v for v in e.attributedata_set.all()]:
        if att.attribute in atts:
            an = att.attribute.name
            att_cols[_mk_col_nm('%s Excerpt' % an)] = att.excerpt
            att_cols[_mk_col_nm('%s Num' % an)] = att.number
            att_cols[_mk_col_nm('%s Severity' % an)] = att.get_severity_display()
            att_cols[_mk_col_nm('%s Reliability' % an)] = att.get_reliability_display()

    return list(att_cols.values())

def gen_exports(sht):
    #values are method names to be used in lookups
    ents = Entry.objects.all()
    base_cols = _gen_base_cols()

    #insert header for base cols and IA cols

    sht.append(_mk_col_nm_lst(base_cols.keys()) + _mk_col_nm_lst(sum(_gen_ia_cols(ents).values(), [])))

    _make_bold(sht.rows[0])

    for e in ents:
        #base and IAs
        sht.append([globals()[t](e) for t in base_cols.values()] + _ins_ias(ents, e))

def export():
    wb = init_xls()
    gen_exports(wb.get_sheet_by_name(EXPORT_TAB))
    gen_meta(wb.get_sheet_by_name(META_TAB))

    _expand_cols(wb)
    return save_virtual_workbook(wb)
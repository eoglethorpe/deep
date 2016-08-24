#TODO: rewrite export_files to except **kwargs and then merge gen bvs and ias

"""exporting entries to xlsx"""
import itertools

from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook
from openpyxl.styles import Font

from entries.export_fields import *
from entries.models import *

EXPORT_TAB = 'DEEP Export | Entries'
META_TAB =  'Metadata'

def _expand_cols(wb):
    """expand all column dims to match max length of header"""
    for sht in wb.worksheets:
        for col in sht.columns:
            if col[0].value:
                sht.column_dimensions[col[0].column].width = max(len(str(col[0].value)), 30)

            #the below makes cells taller
            #cell.alignment = Alignment(wrap_text=True, vertical='top')

def _fill_cells(wb):
    """cheeky fix to prevent overflowing cells - add a space"""
    for sht in wb.worksheets:
        for c in list(itertools.chain(*sht.rows)):
            if c.value in (None, ''):
                c.value = ' '

def _add_filters(ws):
    """create filters for every column"""
    for i,c in enumerate(ws.columns):
         ws.auto_filter.ref = ws

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

def _mk_col_nm(cn):
    return cn.replace(' ', '_').lower()

def _mk_col_nm_lst(cl):
    return [_mk_col_nm(cn) for cn in cl]

#- Date of lead publication
#- Date of information
#- created_by
#- Lead title
#- Confidentiality
#- Source
#- Crisis name
#- Country
#- Admin level 1
#- Admin level 2
#- Admin level 3
#- Admin level 4
#- Admin level 5
#-Affected_groups Level 1
#-Affected group level 2
#-Affected group level 3
#- vulnerable_groups
#- specific_needs_groups
#- Information attribute level 1
#- Information attribute level 2
#- Excerpt
#- Number
#- Reliability
#- Severity
#- Lead ID
#- Entry ID
#- Tag ID

#not included
# Sector
# Sub sector


def _gen_base_vals():
    """which columns should be included and which function is used to create them"""
    return OrderedDict([
            ('Date of Lead Publication' , 'get_lead_created_at'),
            ('Date of Entry Creation' , 'get_ent_created_at'),
            ('Created By' , 'get_created_by'),
            ('Lead Title' , 'get_lead'),
            ('Confidentiality', 'get_confidentiality'),
            ('Source', 'get_source'),
            ('Crisis Name', 'get_crisis'),
            ('Country(s)', 'get_countries'),
            ('Admin Level 1', 'get_admn_lvl1'),
            ('Admin Level 2', 'get_admn_lvl2'),
            ('Admin Level 3', 'get_admn_lvl3'),
            ('Admin Level 4', 'get_admn_lvl4'),
            ('Admin Level 5', 'get_admn_lvl5'),
            ('Affected Groups Level 1', 'get_aff_lvl1'),
            ('Affected Groups Level 2', 'get_aff_lvl2'),
            ('Affected Groups Level 3', 'get_aff_lvl3'),
            ('Vulnerable Groups' , 'get_vuln'),
            ('Specific Needs Groups' , 'get_specific'),
            ('Map Selections' , 'get_geo')])

def _gen_ias():
    """similar to base_vals but for ias"""
    return OrderedDict([
            ('Information Attribute Level 1', 'get_ia_lvl1'),
            ('Information Attribute Level 2', 'get_ia_lvl2'),
            ('Excerpt', 'get_ia_exc'),
            ('Number', 'get_ia_num'),
            ('Reliability', 'get_ia_rel'),
            ('Severity', 'get_ia_sev')])

def _gen_ids():
    """work around to put IDs at the end"""
    return OrderedDict([
            ('Lead ID', 'get_lead_id'),
            ('Entry ID', 'get_entry_id'),
            ('Tag ID', 'get_tag_id')])


def gen_exports(sht):
    #values are method names to be used in lookups
    ents = Entry.objects.all()
    base_cols = _gen_base_vals()
    ia_cols = _gen_ias()
    id_cols =  _gen_ids()

    #insert header for base cols and IA cols
    sht.append(list(base_cols.keys()) + list(ia_cols.keys()) + list(id_cols.keys()))

    _make_bold(sht.rows[0])

    for e in ents:
        for att in e.attributedata_set.all():
            sht.append([globals()[t](e) for t in base_cols.values()] + \
                            [globals()[t](att) for t in ia_cols.values()] + \
                            [globals()[t](e, att) for t in id_cols.values()])


def export():
    wb = init_xls()
    gen_exports(wb.get_sheet_by_name(EXPORT_TAB))
    gen_meta(wb.get_sheet_by_name(META_TAB))

    _expand_cols(wb)
    _fill_cells(wb)
    _add_filters(wb.get_sheet_by_name(EXPORT_TAB))
    return save_virtual_workbook(wb)
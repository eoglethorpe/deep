"""exporting entries to xlsx"""
from collections import OrderedDict
import time

from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook
from openpyxl.styles import Font, Alignment

from entries.export_fields import *
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

def _mk_col_nm(cn):
    return cn.replace(' ', '_').lower()

def _mk_col_nm_lst(cl):
    return [_mk_col_nm(cn) for cn in cl]

def gen_exports(sht):
    #values are method names to be used in lookups
    ents = Entry.objects.all()
    base_cols = gen_base_vals()

    #we don't need the event object to be displayed in our Excel sheet
    base_cols.pop('evt_obj')

    #insert header for base cols and IA cols

    sht.append(_mk_col_nm_lst(base_cols.keys()) + _mk_col_nm_lst(sum(gen_ia_names(ents).values(), [])))

    _make_bold(sht.rows[0])

    for e in ents:
        #base and IAs
        sht.append([globals()[t](e) for t in base_cols.values()] + gen_ias_xls(ents, e))

def export():
    wb = init_xls()
    gen_exports(wb.get_sheet_by_name(EXPORT_TAB))
    gen_meta(wb.get_sheet_by_name(META_TAB))

    _expand_cols(wb)
    return save_virtual_workbook(wb)
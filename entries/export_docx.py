#TODO: heiracrchy should return types, not strings #yolo
"""exporting entries to a docx"""
from operator import itemgetter
from collections import OrderedDict

from docx import Document
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

from entries.export_fields import *


def gen_base_vals():
    """which columns should be included and which function is used to create them"""
    return OrderedDict([
            ('Created At' , 'get_ent_created_at'),
            ('Created By' , 'get_created_by'),
            ('Lead' , 'get_lead'),
            ('Vulnerable Groups' , 'get_vuln'),
            ('Specific Needs Groups' , 'get_specific'),
            ('Affected Groups' , 'get_aff_all'),
            ('Map Selections' , 'get_geo'),
            ('evt_obj', 'get_event')])

def _sort(ents, order):
    """arrange entries based on hierarchy and place into ordered list"""

    #created ODs of {att type; att val (by running function name)}
    r = [OrderedDict(((k,globals()[v](e)) for k,v in gen_base_vals().items())) for e in ents]
    r.sort(key=itemgetter(*order))

    return r

def _colorify_runs(runs, rgb_val):
    """take in a list of runs and make them the same color based on rgb"""
    for r in runs:
        f = r.font
        f.color.rgb = rgb_val

def _add_line(para):
    #a very convoluded way to add a horizontal line to the document
    #see: https://github.com/python-openxml/python-docx/issues/105

    def first_child_found_in(parent, tagnames):
        """
        Return the first child of parent with tag in *tagnames*, or None if
        not found.
        """
        for tagname in tagnames:
            child = parent.find(qn(tagname))
            if child is not None:
                return child
        return None

    def insert_element_before(parent, elm, successors):
        """
        Insert *elm* as child of *parent* before any existing child having
        tag name found in *successors*.
        """
        successor = first_child_found_in(parent, successors)
        if successor is not None:
            successor.addprevious(elm)
        else:
            parent.append(elm)
        return elm

    p = para._p  # p is the <w:p> XML element
    pPr = p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    insert_element_before(pPr, pBdr, successors=(
        'w:shd', 'w:tabs', 'w:suppressAutoHyphens', 'w:kinsoku', 'w:wordWrap',
        'w:overflowPunct', 'w:topLinePunct', 'w:autoSpaceDE', 'w:autoSpaceDN',
        'w:bidi', 'w:adjustRightInd', 'w:snapToGrid', 'w:spacing', 'w:ind',
        'w:contextualSpacing', 'w:mirrorIndents', 'w:suppressOverlap', 'w:jc',
        'w:textDirection', 'w:textAlignment', 'w:textboxTightWrap',
        'w:outlineLvl', 'w:divId', 'w:cnfStyle', 'w:rPr', 'w:sectPr',
        'w:pPrChange'
    ))
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'auto')
    pBdr.append(bottom)


def _get_head(ent, order, doc):
    """take in an entry and order and generate header based on values in order"""
    first = True

    for ord in order:
        #check to see if there's a value for the type
        if len(ent[ord]) > 0:
            if not first:
                pass
#                p.add_run(' | ').bold = True
#                r.bold = True
#               r.italic = True
            p = doc.add_paragraph()
            pf = p.paragraph_format
            pf.line_spacing = Pt(14)

            k_run = p.add_run(ord + ': ')
            k_run.italic = True
            v_run = p.add_run(str(ent[ord]))

            _colorify_runs([k_run, v_run], RGBColor(68,120,202))

            first = False


def _get_bod(ent, order, doc):
    """generate the body of an entry"""
    #use to add space before first IA
    first_ia = True
    ia_exists = False
    for k,v in ent.items():
        #get general base level
        if k not in order and k != 'evt_obj':
            p = doc.add_paragraph()
            p.add_run(k + ': ').bold = True
            p.add_run(str(v))
        #we will use the event objec to find IAs
        elif k == 'evt_obj':
            if first_ia:
                doc.add_paragraph()
                title_p = doc.add_paragraph()
                r = title_p.add_run('INFORMATION ATTRIBUTES')
                f = r.font
                f.bold, f.underline = True, True

                first_ia = False
            for k,v in gen_ias(Entry.objects.all(), v).items():
                #only print IAs for which there is an entry
                if v:
                    ia_exists = True
                    ia_p = doc.add_paragraph()
                    ia_p.add_run(k + ': ').bold = True
                    ia_p.add_run(str(v))

    line_p = doc.add_paragraph()
    _add_line(line_p)

def _gendoc(order, sortents):
    """generate the docx based on given order"""
    d = Document()
    #meta info

    for ent in sortents:
        #show headers
        _get_head(ent, order, d)

        #show base values
        _get_bod(ent, order, d)

    return d

def export(order):
    return _gendoc(order, _sort(Entry.objects.all(), order))
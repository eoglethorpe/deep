#TODO: heiracrchy should return types, not strings #yolo
"""exporting entries to a docx"""
from operator import itemgetter

from docx import Document, RT
from docx.enum.dml import MSO_THEME_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

from entries.export_fields import *

MAPSELS = 'Map Selections'

def gen_base_vals():
    """which columns should be included and which function is used to create them"""
    return OrderedDict([
            ('Lead' , 'get_lead'),
            ('Vulnerable Groups' , 'get_vuln'),
            ('Specific Needs Groups' , 'get_specific'),
            ('Affected Groups' , 'get_aff_all'),
            (MAPSELS , 'get_geo'),
            ('evt_obj', 'get_event')])

def _sort(ents, order):
    """arrange entries based on hierarchy and place into ordered list
        we assume there are a maximum of 5 admin levels and all entries
        are given values for the admin levels"""
    ADMN_LVLS = ['Admin ' + str(v) for v in range(1,6)]


    #replace MAPSELS in order with ADMN_LVLS
    for i,v in enumerate(ADMN_LVLS):
        order.insert(order.index(MAPSELS) + i+1, v)

    order.pop(order.index(MAPSELS))

    #created ODs of {att type; att val (by running function name)}
    r = []
    for e in ents:
        cd = OrderedDict()
        for k,v in gen_base_vals().items():
            #break up geo locations into spereate admin areas and make a string csl for sorting
            if k == MAPSELS:
                out = v
                locs = globals()[v](e)
                for i,lvl in enumerate(ADMN_LVLS):
                    clvl = 'Admin ' + str(i+1)
                    if clvl in locs:
                        cd[lvl] = ', '.join(locs[lvl])
                    else:
                        cd[lvl] = ''

            else:
                cd[k] = globals()[v](e)

        r.append(cd)

    r.sort(key=itemgetter(*order))

    return r

def _colorify_runs(runs, rgb_val):
    """take in a list of runs and make them the same color based on rgb"""
    for r in runs:
        f = r.font
        f.color.rgb = rgb_val

def _add_hyperlink(paragraph, url, text):
    """
    A work around function that places a hyperlink within a paragraph object.
    See: https://github.com/python-openxml/python-docx/issues/74#issuecomment-215678765

    :param paragraph: The paragraph we are adding the hyperlink to.
    :param url: A string containing the required url
    :param text: The text displayed for the url
    :return: A Run object containing the hyperlink
    """

    # This gets access to the document.xml.rels file and gets a new relation id value
    part = paragraph.part
    r_id = part.relate_to(url, RT.HYPERLINK, is_external=True)

    # Create the w:hyperlink tag and add needed values
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id, )
    hyperlink.set(qn('w:history'), '1')

    # Create a w:r element
    new_run = OxmlElement('w:r')

    # Create a new w:rPr element
    rPr = OxmlElement('w:rPr')

    # Create a w:rStyle element, note this currently does not add the hyperlink style as its not in
    # the default template, I have left it here in case someone uses one that has the style in it
    rStyle = OxmlElement('w:rStyle')
    rStyle.set(qn('w:val'), 'Hyperlink')

    # Join all the xml elements together add add the required text to the w:r element
    rPr.append(rStyle)
    new_run.append(rPr)
    new_run.text = text
    hyperlink.append(new_run)

    # Create a new Run object and add the hyperlink into it
    r = paragraph.add_run()
    r._r.append(hyperlink)

    # A workaround for the lack of a hyperlink style (doesn't go purple after using the link)
    # Delete this if using a template that has the hyperlink style in it
    r.font.color.theme_color = MSO_THEME_COLOR_INDEX.HYPERLINK
    r.font.underline = True

    return r

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
    runs = []

    for ord in order:
        #check to see if there's a value for the type
        if len(ent[ord]) > 0:
            p = doc.add_paragraph()
            pf = p.paragraph_format
            pf.line_spacing = Pt(14)

            #segment geoareas into their admin levels
            if ord == MAPSELS:
                for k,v in ent[order].items():
                    l_run = p.add_run(k + ': ')
                    l_run.bold = True
                    n_run = v
                    runs.append(l_run)
                    runs.append(n_run)
                    doc.add_paragraph()

            else:
                k_run = p.add_run(ord + ': ')
                k_run.italic = True
                v_run = p.add_run(str(ent[ord]))
                runs.append(k_run)
                runs.append(v_run)

            _colorify_runs(runs, RGBColor(68,120,202))

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
        #we will use the event object to find IAs
        elif k == 'evt_obj':
            if first_ia:
                doc.add_paragraph()
                title_p = doc.add_paragraph()
                r = title_p.add_run('INFORMATION ATTRIBUTES')
                f = r.font
                f.bold, f.underline = True, True

                first_ia = False
            for ik,iv in gen_ias(Entry.objects.all(), v).items():
                #only print IAs for which there is an entry
                if iv:
                    ia_exists = True
                    ia_p = doc.add_paragraph()
                    ia_p.add_run(ik + ': ').bold = True
                    ia_p.add_run(str(iv))

                    #add in (source [url'd], date)
                    if ik.endswith('excerpt'):
                        ia_p.add_run(' (')
                        if get_lead_url(v):
                            if not get_source(v):
                                _add_hyperlink(ia_p, get_lead_url(v), 'Reference')
                            else:
                                _add_hyperlink(ia_p, get_lead_url(v), get_source(v))
                        else:
                            ia_p.add_run('Manual Entry')

                        ia_p.add_run(', ' + get_lead_created_at_dt(v) + ')')

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
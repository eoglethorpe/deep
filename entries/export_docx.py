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
            ('Affected Groups' , 'get_aff_all_str'),
            ('Sector' , 'get_sector_str'),
            ('Sub-Sector' , 'get_sub_sector_str'),
            (MAPSELS , 'get_geo_dict'),
            ('Name Source', 'get_source'),
            ('Publication Date', 'get_lead_created_at_dt_num'),
            ('Confidentiality', 'get_confidentiality'),
            ('Vulnerable Groups' , 'get_vuln_str'),
            ('Specific Needs Groups' , 'get_specific_str'),
            ('evt_obj', 'get_event')])

def _sort(ents, order):
    """arrange entries based on hierarchy and place into ordered list
        we assume there are a maximum of 5 admin levels and all entries
        are given values for the admin levels"""

    ADMN_LVLS = ['Admin ' + _xstr(v) for v in range(1,6)]


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
                    clvl = 'Admin ' + _xstr(i+1)
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


def _add_head(ent, order, doc):
    """take in an entry and order and generate header based on values in order"""
    first = True
    runs = []

    for ord in order:
        #check to see if there's a value for the type
        if len(ent[ord]) > 0:
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = Pt(14)

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
                v_run = p.add_run(_xstr(ent[ord]))
                runs.append(k_run)
                runs.append(v_run)

            _colorify_runs(runs, RGBColor(68,120,202))

            first = False

def _xstr(v):
    """safely convert a value to string"""
    if v is None:
        return ''

    try:
        return str(v.encode('utf8').decode('UTF-8'))

    except:
        return str(v)

def _add_bod(ent, order, doc):
    """generate the body of an entry"""
    #use to add space before first IA
    first_ia = True

    #add lead
    t = doc.add_paragraph()
    r = t.add_run(get_lead_nm(ent['evt_obj']))
    r.font.bold, r.font.underline = True, True

    tbl = doc.add_table(rows=0, cols = 2, style = 'Table Grid')
    for k,v in ent.items():
        #get general base level... make it as a table so that we can have nice justifaction
        if k != 'evt_obj':
            row = tbl.add_row().cells
            row[0].text = k
            row[0].paragraphs[0].runs[0].bold = True
            row[1].text = _xstr(v)

            row[0].width, row[1].width = 4828800, 4828800

        #find IAs with event object
        elif k == 'evt_obj':
            if first_ia:
                doc.add_paragraph()
                # r = title_p.add_run('INFORMATION ATTRIBUTES')
                # r.font.bold, r.font.underline = True, True

                first_ia = False
            for ik,iv in gen_ias(Entry.objects.all(), v).items():
                #only print IAs for which there is an entry
                if iv:
                    ia_p = doc.add_paragraph()
                    ia_p.add_run(ik + ': ').bold = True
                    ia_p.add_run(_xstr(iv))

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

                        ia_p.add_run(', ' + get_lead_created_at_dt_readable(v) + ')')

    line_p = doc.add_paragraph()
    _add_line(line_p)


def _gen_bili(sortents):
    """generate bibliography
        return: list of oderededdicts with biliography entries:
        {
            Name of Source : name,
            Title of Lead : title,
            Publication Date : date(MM/DD/YYYY),
            Link: hyperlink (all in Title Case)
        }`
    """
    return [
        OrderedDict([
            ('Source' , get_source(e['evt_obj'])),
            ('Title' , get_lead_nm_title_case(e['evt_obj'])),
            ('Date' , get_lead_created_at_dt_num(e['evt_obj'])),
            ('URL' , get_lead_url(e['evt_obj']))
        ]) for e in sortents
    ]

def _add_bili(sortents, d):
    """insert bibliography into doc. Bib format:
    Name of Source. Title of Lead. Publication Date (MM/DD/YYYY). hyperlink (all in Title Case)
    UNHCR. Dont Have to Live Like a Refugee. 31/08/2016. https://mylink.com/
"""
    d.add_paragraph()
    bib = d.add_paragraph()
    bib.add_run('Bibliography').bold = True

    for e in _gen_bili(sortents):
        d.add_paragraph()
        ent = d.add_paragraph()
        for i,v in enumerate(e.items()):
            if not v[1]:
                run = 'Missing ' + v[0]
            elif v[0] == 'URL':
                _add_hyperlink(ent, v[1], v[1] + ' ')
                run = ''
            else:
                run = _xstr(v[1])

            #to not add a period to last element
            if i < len(e.values())-1:
                ent.add_run(run + '. ')
            else:
                ent.add_run(run)


def _add_meta(order, d, filter = None):
    """add in filter and ordering info"""
    p = d.add_paragraph()

    if not filter:
        p.add_run('Filter: None Provided').bold = True
    else:
        p.add_run('#TellEwanToFixThis').bold = True

    op = d.add_paragraph()
    op.add_run('Entry Order:').bold=True
    for v in order:
        d.add_paragraph(v, style='ListNumber')

    _add_line(d.add_paragraph())

def _gendoc(order, sortents):
    """generate the docx based on given order"""
    d = Document()

    #meta info
    _add_meta(order, d)

    for ent in sortents:
        #show headers
        #_add_head(ent, order, d)

        #show base values
        _add_bod(ent, order, d)

    #show bibliography
    _add_bili(sortents, d)

    return d

def export(order):
    return _gendoc(order, _sort(Entry.objects.all(), order))
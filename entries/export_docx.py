"""exporting entries to a docx"""
from operator import itemgetter

from docx import Document
from docx.shared import Inches

ENTTEXT = 'enttext'
def test():
    """pull down all relevant fields for entries"""

    'geoarea, reliability, severity, affected, sector'

    t = [
        {
                ENTTEXT: 'this is the text',
                'geoarea' : 'nepal',
                'reliability': 2,
                'severity': 'YYYY',
                'affected': 'X',
                'sector': 'other'
        },

        {
                ENTTEXT: 'this is the text',
                'geoarea' : 'india',
                'reliability': 2,
                'severity': 'YYYY',
                'affected': 'X',
                'sector': 'other'
        },

        {
                ENTTEXT: 'this is the text',
                'geoarea' : 'sri lanka',
                'reliability': 100,
                'severity': 'Bc',
                'affected': 'Y',
                'sector': 'wash'
        }

    ]
    return t

def sort(ents, order):
    """arrange dict based on hierarchy and place into ordered list"""
    ents.sort(key=itemgetter(*order))
    return ents

def gather():
    """pull down all relevant fields for entries into a list of dicts
        stucture: [{enttext: e1, f1 : v1, f2 : v2...}, {enttext: e1, f1 : v1 ...}]
        for now just do test"""

def _gen_get_head(ent, order, doc):
    """take in an entry and order and generate header"""
    p = doc.add_paragraph()
    first = True

    for e in order:
        if e in ent:
            if not first:
                p.add_run('  | ').bold = True
            p.add_run(e + ': ' + str(ent[e])).bold = True
            first = False

def gen(order, ents):
    """generate the docx based on given order"""
    d = Document()
    #meta info

    for v in ents:
        #show entry info
        _gen_get_head(v, order, d)

        #show entry text
        f = d.add_paragraph(v[ENTTEXT]).paragraph_format.left_indent = Inches(0.5)
        d.add_paragraph()

    return d

def export(order):
    d = gen(order, sort(test(), order))

    d.save('demo.docx')
    return d
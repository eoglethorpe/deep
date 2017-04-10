from entries.export_entries_docx import export_docx_new_format, export_docx
from django.conf import settings
from subprocess import call
import os
import tempfile


PDF_TMP_LOC = '/tmp/pdf'


def convert_docx_to_pdf(filepath):
    filename = filepath.split('/')[-1]
    call(['libreoffice', '--headless', '--convert-to', 'pdf', filepath,
          '--outdir', PDF_TMP_LOC], stdout=open(os.devnull, 'wb'))
    pdf = open(os.path.join(PDF_TMP_LOC, filename+'.pdf'), 'rb')
    os.remove(os.path.join(PDF_TMP_LOC, filename+'.pdf'))
    return pdf.read()


def export_pdf(order, event, informations=None, export_geo=False):
    fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
    export_docx(order, event, informations, export_geo).save(fp)
    return convert_docx_to_pdf(fp.name)


def export_pdf_new_format(order, event, informations=None, export_geo=False):
    fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
    export_docx_new_format(order, event, informations).save(fp)
    return convert_docx_to_pdf(fp.name)

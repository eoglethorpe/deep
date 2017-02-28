from django.conf import settings

from readability.readability import Document

# import pdfminer
from pdfminer.pdfinterp import PDFResourceManager, process_pdf
from pdfminer.converter import TextConverter  # , HTMLConverter
from pdfminer.layout import LAParams

# import textract

import requests
# import string
# import html
import tempfile
from deep._import_docx import process as docx_simplify

import re
# import shutil
# import unicodedata


class StripError(Exception):
    def __init__(self, *args, **kwargs):
        super(StripError, self).__init__(*args, **kwargs)


class WebDocument:
    """Web documents can be html or pdf.
    """

    def __init__(self, url):

        def write_file(r, fp):
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    fp.write(chunk)
            return fp

        self.html = None
        self.pdf = None
        self.docx = None

        try:
            r = requests.head(url)
        except:
            # If we can't get header, assume html and try to continue.
            r = requests.get(url)
            self.html = r.content
            return

        html_types = ["text/html", "text/plain"]
        if any(x in r.headers["content-type"] for x in html_types):
            r = requests.get(url)
            self.html = r.content

        elif "application/pdf" in r.headers["content-type"]:
            fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
            r = requests.get(url, stream=True)
            # fp.write(r.content)
            write_file(r, fp)

            # self.temp = fp
            self.pdf = fp

        elif any(x in r.headers["content-type"]
                 for x in ['application/vnd.openxmlformats-officedocument'
                           '.wordprocessingml.document', ]):
            fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
            r = requests.get(url, stream=True)
            write_file(r, fp)
            self.docx = fp


class HtmlStripper:
    """Stripper class to simplify HTML documents.
    """

    def __init__(self, html):
        self.doc = html

    def simplify(self):
        if not self.doc:
            raise StripError("Not a html document")

        summary = Document(self.doc).summary()
        title = Document(self.doc).short_title()
        html = "<h1>" + title + "</h1>" + summary

        regex = re.compile('\n*', flags=re.IGNORECASE)
        html = regex.sub('', html)
        return html


class PdfStripper:
    """Stripper class to simplify PDF documents.
    """

    def __init__(self, doc):
        self.doc = doc

    def simplify(self):
        if not self.doc:
            raise StripError("Not a pdf document")

        fp = self.doc
        fp.seek(0)
        outfp = tempfile.TemporaryFile("w+")

        rmgr = PDFResourceManager()
        params = LAParams()
        # HTMLConverter(rmgr, outfp, laparams=params)
        device = TextConverter(rmgr, outfp, laparams=params)
        process_pdf(rmgr, device, fp, None, 0)

        fp.close()

        outfp.seek(0)
        content = outfp.read()
        outfp.close()

        return content

        # html = HtmlStripper(content).simplify()
        # regex = re.compile('\n*', flags=re.IGNORECASE)
        # html = regex.sub('', html)
        # return html
        # return textract.process(self.file_path)


class DocxStripper:
    """Stripper class to simplify PDF documents.
    """

    def __init__(self, docx):
        self.docx = docx

    def simplify(self):
        if not self.docx:
            raise StripError("Not a web document")

        content, images = docx_simplify(self.docx)

        return content

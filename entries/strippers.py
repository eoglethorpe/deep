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


def write_file(r, fp):
    for chunk in r.iter_content(chunk_size=1024):
        if chunk:
            fp.write(chunk)
    return fp

class StripError(Exception):
    def __init__(self, *args, **kwargs):
        super(StripError, self).__init__(*args, **kwargs)


class WebDocument:
    """Web documents can be html or pdf.
    """

    def __init__(self, url):

        self.html = None
        self.pdf = None
        self.docx = None
        self.pptx = None

        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

        try:
            r = requests.head(url, headers=headers)
        except:
            # If we can't get header, assume html and try to continue.
            r = requests.get(url, headers=headers)
            self.html = r.content
            return

        html_types = ["text/html", "text/plain"]
        if any(x in r.headers["content-type"] for x in html_types):
            r = requests.get(url, headers=headers)
            self.html = r.content

        elif "application/pdf" in r.headers["content-type"]:
            fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
            r = requests.get(url, stream=True, headers=headers)
            # fp.write(r.content)
            write_file(r, fp)

            # self.temp = fp
            self.pdf = fp

        elif any(x in r.headers["content-type"]
                 for x in ['application/vnd.openxmlformats-officedocument'
                           '.wordprocessingml.document', ]):
            fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
            r = requests.get(url, stream=True, headers=headers)
            write_file(r, fp)
            self.docx = fp

        elif any(x in r.headers["content-type"]
                 for x in ['application/vnd.openxmlformats-officedocument'
                           '.presentationml.presentation', ]):
            fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
            r = requests.get(url, stream=True, headers=headers)
            write_file(r, fp)
            self.pptx = fp


class HtmlStripper:
    """Stripper class to simplify HTML documents.
    """

    def __init__(self, html):
        self.doc = html

    def simplify(self):
        if not self.doc:
            raise StripError("Not a html document")

        html_body = Document(self.doc)
        summary = html_body.summary()
        title = html_body.short_title()
        images = []

        for img in html_body.reverse_tags(html_body.html, 'img'):
            try:
                fp = tempfile.NamedTemporaryFile(dir=settings.BASE_DIR)
                r = requests.get(img.get('src'), stream=True)
                write_file(r, fp)
                images.append(fp)
            except:
                pass

        html = "<h1>" + title + "</h1>" + summary

        regex = re.compile('\n*', flags=re.IGNORECASE)
        html = regex.sub('', html)
        return html, images


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

        return content, None

        # html = HtmlStripper(content).simplify()
        # regex = re.compile('\n*', flags=re.IGNORECASE)
        # html = regex.sub('', html)
        # return html
        # return textract.process(self.file_path)


class DocxStripper:
    """Stripper class to simplify Docx documents.
    """

    def __init__(self, docx):
        self.docx = docx

    def simplify(self):
        if not self.docx:
            raise StripError("Not a docx document")

        content, images = docx_simplify(self.docx)

        return content, images


class PptxStripper:
    """Stripper class to simplify PPTX documents.
    """

    def __init__(self, pptx):
        self.pptx = pptx

    def simplify(self):
        if not self.pptx:
            raise StripError("Not a pptx document")

        content, images = docx_simplify(self.pptx, pptx=True)

        return content, images

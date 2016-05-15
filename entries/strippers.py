import requests
import html
import tempfile

from readability.readability import Document

import pdfminer
from pdfminer.pdfinterp import PDFResourceManager, process_pdf
from pdfminer.converter import HTMLConverter, TextConverter
from pdfminer.layout import LAParams


class StripError(Exception):
    def __init__(self, *args, **kwargs):
        super(StripError, self).__init__(*args, **kwargs)


class WebDocument:
    """Web documents can be html or pdf.
    """

    def __init__(self, url):
        r = requests.head(url)

        if "text/html" in r.headers["content-type"]:
            r = requests.get(url)
            self.html = r.content
            self.pdf = None

        elif "application/pdf" in r.headers["content-type"]:
            self.html = None
            fp = tempfile.TemporaryFile()
            r = requests.get(url, stream=True)
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    fp.write(chunk)
            self.pdf = fp


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
        return "<h1>" + title + "</h1>" + summary


class PdfStripper:
    """Stripper class to simplify PDF documents.
    """

    def __init__(self, pdf_file):
        self.doc = pdf_file

    def simplify(self):
        if not self.doc:
            raise StripError("Not a pdf document")

        fp = self.doc
        fp.seek(0)
        outfp = tempfile.TemporaryFile("w+")

        rmgr = PDFResourceManager()
        params = LAParams()
        device = HTMLConverter(rmgr, outfp, laparams=params)
        process_pdf(rmgr, device, fp, None, 0)

        fp.close()

        outfp.seek(0)
        content = outfp.read()
        outfp.close()
        return HtmlStripper(content).simplify()
import docx

from entries.models import *

# From johanvandegriff @ https://github.com/python-openxml/python-docx/issues/74
def add_hyperlink(paragraph, url, text):
    """
    A function that places a hyperlink within a paragraph object.

    :param paragraph: The paragraph we are adding the hyperlink to.
    :param url: A string containing the required url
    :param text: The text displayed for the url
    :return: The hyperlink object
    """

    # This gets access to the document.xml.rels file and gets a new relation id value
    part = paragraph.part
    r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)

    # Create the w:hyperlink tag and add needed values
    hyperlink = docx.oxml.shared.OxmlElement('w:hyperlink')
    hyperlink.set(docx.oxml.shared.qn('r:id'), r_id, )

    # Create a w:r element
    new_run = docx.oxml.shared.OxmlElement('w:r')

    # Create a new w:rPr element
    rPr = docx.oxml.shared.OxmlElement('w:rPr')

    # Join all the xml elements together add add the required text to the w:r element
    new_run.append(rPr)
    new_run.text = text
    hyperlink.append(new_run)

    paragraph._p.append(hyperlink)

    return hyperlink


def add_excerpt_info(d, info):
    # Show the excerpt
    d.add_paragraph(info.excerpt)
    # Show the reference
    ref = d.add_paragraph()
    if info.entry.lead.url and info.entry.lead.url != "":
        add_hyperlink(ref, info.entry.lead.url, "Reference")
    
    elif Attachment.objects.filter(lead=info.entry.lead).count() > 0:
        add_hyperlink(ref, info.entry.lead.attachment.upload.url, "Reference")

    # TODO Find out whether to show date of info or lead
    if info.date:
        ref.add_run(" {}".format(info.date.strftime("%B %d, %Y")))

    d.add_paragraph("Reliability: {}\nSeverity: {}".format(info.reliability.name, info.severity.name))


def set_style(style):
    style.paragraph_format.space_after = docx.shared.Pt(6)
    style.paragraph_format.alignment = docx.enum.text.WD_ALIGN_PARAGRAPH.LEFT


def export_docx(order):
    d = docx.Document('static/doc_export/template.docx')

    # Set document styles
    set_style(d.styles["Normal"])
    set_style(d.styles["Heading 1"])
    set_style(d.styles["Heading 2"])
    set_style(d.styles["Heading 3"])
    set_style(d.styles["Heading 4"])
    set_style(d.styles["Heading 5"])
    

    # TODO: Hierarchy and filter

    # The leads for which excerpts we displayed
    leads = []

    # Get each information pillar
    pillars = InformationPillar.objects.all()
    for pillar in pillars:
        h2 = d.add_heading(pillar.name, level=2)
        
        # Get each subpillar
        subpillars = pillar.informationsubpillar_set.all()
        for subpillar in subpillars:
            h3 = d.add_heading(subpillar.name, level=3)

            if pillar.contains_sectors:
                # For each sector
                for sector in Sector.objects.all():
                    h4 = d.add_heading(sector.name, level=4)

                    attributes = InformationAttribute.objects.filter(subpillar=subpillar,
                                                                     sector=sector,
                                                                     subsector=None)
                    for attr in attributes:
                        info = attr.information
                        add_excerpt_info(d, info)
                        leads.append(info.entry.lead)

                    # For each subsector
                    for subsector in sector.subsector_set.all():
                        h4 = d.add_heading(subsector.name, level=5)

                        attributes = InformationAttribute.objects.filter(subpillar=subpillar,
                                                                        sector=sector,
                                                                        subsector=subsector)
                        for attr in attributes:
                            info = attr.information
                            add_excerpt_info(d, info)
                            leads.append(info.entry.lead)
            
            else:
                # Get all excerpts belonging to this subpillar
                attributes = InformationAttribute.objects.filter(subpillar=subpillar,
                                                                 sector=None,
                                                                 subsector=None)
                for attr in attributes:
                    info = attr.information
                    add_excerpt_info(d, info)
                    leads.append(info.entry.lead)

    d.add_page_break()

    # Bibliography
    h1 = d.add_heading("Bibliography", level=1)
    for lead in leads:
        p = d.add_paragraph()
        if lead.source:
            p.add_run(lead.source.name)
        else:
            p.add_run("Missing source")

        p.add_run(". {}.".format(lead.name))
        if lead.published_at:
            p.add_run("{}.".format(lead.published_at.strftime("%B %d, %Y")))

        p.add_run("\n")
        if lead.url and lead.url != "":
            add_hyperlink(p, lead.url, lead.url)
        
        elif Attachment.objects.filter(lead=lead).count() > 0:
            add_hyperlink(p, lead.attachment.upload.url, lead.attachment.upload.url)

        else:
            p.add_run("Missing url.")

    d.add_page_break()

    return d
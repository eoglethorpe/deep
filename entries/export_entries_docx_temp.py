from docx import Document

from entries.models import *


def export_docx(order):
    d = Document()

    # TODO: Sorting

    entries = Entry.objects.all()
    for entry in entries:

        # Entry title and caption
        h1 = d.add_heading(entry.lead.name, level=1)
        caption = d.add_paragraph(
            "{} - {}".format(entry.modified_by.get_full_name(), entry.modified_at.strftime("%B %d, %Y")),
            style='Caption'
        )

        d.add_paragraph("_" * 70)

        # Now show each excerpt
        for info in entry.entryinformation_set.all():

            # The excerpt text
            d.add_paragraph().add_run(info.excerpt).italic = True

            # Reliability, severity, number and date
            p = d.add_paragraph()
            p.add_run("Reliability: ").bold = True
            p.add_run(info.reliability.name)

            p = d.add_paragraph()
            p.add_run("Severity: ").bold = True
            p.add_run(info.severity.name)
            
            if info.number:
                p = d.add_paragraph()
                p.add_run("Number: ").bold = True
                p.add_run(str(info.number))

            if info.date:
                p = d.add_paragraph()
                p.add_run("Date: ").bold = True
                p.add_run("Date: {}".format(info.date.strftime("%B %d, %Y")))

            # Vulnerable groups, specific needs groups, affected_groups, map_selections
            vgs = info.vulnerable_groups.all()
            if len(vgs) > 0:
                d.add_paragraph().add_run("Vulnerable groups:").bold=True
                d.add_paragraph(", ".join(vg.name for vg in vgs))

            sngs = info.specific_needs_groups.all()
            if len(sngs) > 0:
                d.add_paragraph().add_run("Specific needs groups").bold=True
                d.add_paragraph(", ".join(sng.name for sng in sngs))

            ags = info.affected_groups.all()
            if len(ags) > 0:
                d.add_paragraph().add_run("Affected groups").bold=True
                d.add_paragraph(", ".join(ag.name for ag in ags))

            mss = info.map_selections.all()
            if len(mss) > 0:
                d.add_paragraph().add_run("Geo locations").bold=True
                d.add_paragraph(", ".join(ms.name for ms in mss))

            # Attributes
            attributes = info.informationattribute_set.all()
            if len(attributes) > 0:
                d.add_paragraph().add_run("Attributes").bold=True
                for attr in attributes:
                    a = attr.subpillar.pillar.name + " / " + attr.subpillar.name
                    if attr.sector:
                        a += " / " + attr.sector.name
                        if attr.subsector:
                            a += " / " + attr.subsector.name
                    d.add_paragraph(a)

            d.add_paragraph("_"*70)

        
        d.add_page_break()

    return d
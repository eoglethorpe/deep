import string

from excel_writer import ExcelWriter, RowCollection
from entries import models as entry_models
from openpyxl.styles import Font  # , Color


def export_xls(title, event_pk=None):

    # Create a spreadsheet and get active workboot
    ew = ExcelWriter()
    ws = ew.get_active()
    ws.title = "Split Entries"
    wsg = ew.wb.create_sheet("Grouped Entries")

    # Create title row
    titles = [
        "Date of Lead Publication", "Date of Information", "Created By",
        "Date Imported", "Lead Title", "Source", "Excerpt", "Reliability",
        "Severity", "Number", "Demographic Groups", "Specific Needs Groups",
        "Affected Groups", "Pillar", "Subpillar", "Sector", "Subsector",
        "Date Imported"
    ]

    if event_pk:
        countries = entry_models.Event.objects.get(pk=event_pk).countries.all()
    else:
        countries = entry_models.Country.objects.all()

    for country in countries:
        admin_levels = country.adminlevel_set.all()
        for admin_level in admin_levels:
            titles.append(admin_level.name)

    for i, t in enumerate(titles):
        ws.cell(row=1, column=i+1).value = t
        ws.cell(row=1, column=i+1).font = Font(bold=True)

        wsg.cell(row=1, column=i+1).value = t
        wsg.cell(row=1, column=i+1).font = Font(bold=True)

    ew.auto_fit_cells_in_row(1, ws)
    ew.auto_fit_cells_in_row(1, wsg)

    if event_pk:
        # Add each information in each entry belonging to this event
        informations = entry_models.EntryInformation.objects.filter(
                            entry__lead__event__pk=event_pk, entry__template=None)
    else:
        # All information
        informations = entry_models.EntryInformation.objects.filter(entry__template=None)

    grouped_rows = []
    for i, info in enumerate(informations):
        rows = RowCollection(1)

        rows.add_values([
            info.entry.lead.published_at, info.date, info.entry.modified_by,
            info.entry.modified_at.date(), info.entry.lead.name,
            info.entry.lead.source, xstr(info.excerpt),
            info.reliability.name, info.severity.name, info.number
        ])

        # Column Name `Demographic Groups` Renamed to
        # `Vulnerable Group` as specified in Issue #280
        rows.permute_and_add(info.vulnerable_groups.all())
        rows.permute_and_add(info.specific_needs_groups.all())
        rows.permute_and_add(info.affected_groups.all())

        attributes = []
        for attr in info.informationattribute_set.all():
            attr_data = [attr.subpillar.pillar.name, attr.subpillar.name]

            if attr.sector:
                attr_data.append(attr.sector.name)
                if attr.subsectors.count() > 0:
                    for ss in attr.subsectors.all():
                        attributes.append(attr_data + [ss.name])
                else:
                    attributes.append(attr_data + [''])
            else:
                attributes.append(attr_data + ['', ''])

        rows.permute_and_add_list(attributes)

        for country in countries:
            admin_levels = country.adminlevel_set.all()
            for admin_level in admin_levels:
                selections = []
                for map_selection in info.map_selections.all():
                    if admin_level == map_selection.admin_level:
                        selections.append(map_selection.name)
                rows.permute_and_add(selections)

        ew.append(rows.rows, ws)
        grouped_rows.append(rows.group_rows)

    ew.append(grouped_rows, wsg)

    return ew.get_http_response(title)


def xstr(conv):
    """remove illegal characters from a string (errors from PDFs etc)"""
    return "".join(filter(lambda x: x in string.printable, conv))

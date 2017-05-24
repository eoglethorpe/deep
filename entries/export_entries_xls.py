import string

from excel_writer import ExcelWriter, RowCollection
from entries import models as entry_models
from openpyxl.styles import Font  # , Color


def format_date(date):
    if date:
        return date.strftime('%d-%m-%Y')
    else:
        return None


def export_xls(title, event_pk=None, information_pks=None):

    # Create a spreadsheet and get active workbook
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
    ]

    if event_pk:
        countries = entry_models.Event.objects.get(pk=event_pk).countries.all().distinct()
    else:
        countries = entry_models.Country.objects.all().distinct()

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
                            entry__lead__event__pk=event_pk, entry__template=None).distinct()
    else:
        # All information
        informations = entry_models.EntryInformation.objects.filter(entry__template=None).distinct()

    if information_pks:
        informations = informations.filter(pk__in=information_pks)

    grouped_rows = []
    for i, info in enumerate(informations):
        try:
            rows = RowCollection(1)

            rows.add_values([
                format_date(info.entry.lead.published_at), format_date(info.date), info.entry.created_by,
                format_date(info.entry.created_at.date()), info.entry.lead.name,
                info.entry.lead.source_name, xstr(info.excerpt),
                info.reliability.name, info.severity.name, info.number
            ])

            # Column Name `Demographic Groups` Renamed to
            # `Vulnerable Group` as specified in Issue #280
            rows.permute_and_add(info.vulnerable_groups.all())
            rows.permute_and_add(info.specific_needs_groups.all())
            rows.permute_and_add(info.affected_groups.all())

            attributes = []
            if info.informationattribute_set.count() > 0:
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
            else:
                attributes.append(['', '', '', ''])

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
        except:
            pass

    ew.append(grouped_rows, wsg)

    return ew.get_http_response(title)


def export_and_save(event_pk, filename):
    # Create a spreadsheet and get active workbook
    ew = ExcelWriter()
    ws = ew.get_active()
    ws.title = "Split Entries"
    wsg = ew.wb.create_sheet("Grouped Entries")

    # Create title row
    titles = [
        "Country", "Date of Lead Publication", "Date of Information", "Created By",
        "Date Imported", "Lead Title", "Source", "Excerpt", "Reliability",
        "Severity", "Number", "Demographic Groups", "Specific Needs Groups",
        "Affected Groups", "Pillar", "Subpillar", "Sector", "Subsector",
    ]

    countries = entry_models.Event.objects.get(pk=event_pk).countries.all().distinct()

    for country in countries:
        admin_levels = country.adminlevel_set.all()
        for i, admin_level in enumerate(admin_levels):
            titles.append('Admin {}'.format(i))

    for i, t in enumerate(titles):
        ws.cell(row=1, column=i+1).value = t
        ws.cell(row=1, column=i+1).font = Font(bold=True)

        wsg.cell(row=1, column=i+1).value = t
        wsg.cell(row=1, column=i+1).font = Font(bold=True)

    ew.auto_fit_cells_in_row(1, ws)
    ew.auto_fit_cells_in_row(1, wsg)

    # Add each information in each entry belonging to this event
    informations = entry_models.EntryInformation.objects.filter(
                        entry__lead__event__pk=event_pk, entry__template=None).distinct()

    grouped_rows = []
    for i, info in enumerate(informations):
        try:
            rows = RowCollection(1)

            rows.permute_and_add(info.entry.lead.event.countries.all())

            rows.add_values([
                format_date(info.entry.lead.published_at), format_date(info.date), info.entry.created_by,
                format_date(info.entry.created_at.date()), info.entry.lead.name,
                info.entry.lead.source_name, xstr(info.excerpt),
                info.reliability.name, info.severity.name, info.number
            ])

            # Column Name `Demographic Groups` Renamed to
            # `Vulnerable Group` as specified in Issue #280
            rows.permute_and_add(info.vulnerable_groups.all())
            rows.permute_and_add(info.specific_needs_groups.all())
            rows.permute_and_add(info.affected_groups.all())

            attributes = []
            if info.informationattribute_set.count() > 0:
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
            else:
                attributes.append(['', '', '', ''])

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
        except:
            pass

    ew.append(grouped_rows, wsg)
    ew.save_to(filename)


def xstr(conv):
    try:
        """remove illegal characters from a string (errors from PDFs etc)"""
        return "".join(filter(lambda x: x in string.printable, conv))
    except:
        return str(conv)

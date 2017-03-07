from django.http import HttpResponse

from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook
# from openpyxl.styles import Font


class ExcelWriter:
    def __init__(self):
        self.wb = Workbook()

    def get_active(self):
        return self.wb.active

    def get_http_response(self, title):
        vwb = save_virtual_workbook(self.wb)
        response = HttpResponse(content=vwb,
                                content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename = %s' %\
                                          (title+".xlsx")
        return response

    def auto_fit_cells_in_row(self, row_id, ws=None):
        if ws is None:
            ws = self.get_active()
        row = list(ws.rows)[row_id-1]
        for cell in row:
            if cell.value:
                ws.column_dimensions[cell.column].width =\
                        max(len(cell.value), 15)

    def append(self, rows, ws=None):
        if ws is None:
            ws = self.get_active()
        for row in rows:
            ws.append(row)


class RowCollection:
    def __init__(self, n):
        self.rows = []
        self.group_rows = []
        for i in range(n):
            self.rows.append([])

    def permute_and_add(self, values):
        n = len(values)
        if n == 0:
            self.add_value('')
            return

        if n == 1:
            self.add_value(values[0])
            return

        oldrows = self.rows[:]
        for i in range(1, n):
            for j, row in enumerate(oldrows):
                self.rows.insert(i*len(oldrows)+j, row.copy())

        for i in range(0, n):
            for j in range(0, len(oldrows)):
                self.rows[i*len(oldrows)+j].append(str(values[i]))

        self.group_rows.append(', '.join(map(str, values)))

    def permute_and_add_list(self, values_list):
        n = len(values_list)
        if n == 0:
            self.add_value('')
            return

        if n == 1:
            self.add_values(values_list[0])
            return

        oldrows = self.rows[:]
        for i in range(1, n):
            for j, row in enumerate(oldrows):
                self.rows.insert(i*len(oldrows)+j, row.copy())

        for i in range(0, n):
            for j in range(0, len(oldrows)):
                for k in range(0, len(values_list[i])):
                    self.rows[i*len(oldrows)+j].append(str(values_list[i][k]))

        for values in values_list:
            self.group_rows.append(', '.join(map(str, values)))

    def add_value(self, value):
        for row in self.rows:
            row.append(str(value))
        self.group_rows.append(str(value))

    def add_values(self, values):
        for val in values:
            self.add_value(val)

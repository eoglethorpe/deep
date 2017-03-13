"""
from django.test import TestCase

from entries.export_xls import _split_row

class ExportXlsTest(TestCase):
    def test_split_row(self):
        self.assertEqual(len(_split_row(['only strings', 'another string'])),
                         1)
        self.assertEqual(len(_split_row(['just one list', 'blank', []])), 1)
        self.assertEqual(len(_split_row(['many lists', ['f1', 'f2', 'f3'],
                                        ['e1', 'e2'], ['li','st']])), 12)
        self.assertEqual(len(_split_row(['one list', ['l1','l2', 'l3']])), 3)
        self.assertEqual(len(_split_row([['only list', 'more', 'more']])), 3)
"""

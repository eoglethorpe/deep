"""comparison of HTTP URLs in DEEP vs HTTPS"""
import os
import csv

# import numpy as np
# import pandas as pd
import grequests

class Explore(object):

    def check_bad(self):
        """check to see if http URLs can be connected to using https"""
        ok_https = []
        bad_https = []
        check = []

        def exception_handler(request, exception):
            bad_https.append(request.url, exception)

        for i,v in enumerate(self.urls[:150]):
             if v.split(':')[0] == 'http':
                check.append(v)

                if len(check) == 100:
                    print(i)
                    rs = (grequests.get(u) for u in check)
                    ok_https.append([v for v in rs if v is not None])
        pass

    def imp_csv(self):
        #read csv
        ret_url = []
        with open(self.loc) as f:
            reader = csv.reader(f)
            for row in reader:
                ret_url.append(row[7])
        return ret_url

    def initial_cnt(self):
        print('counts of types:')
        # print(pd.Series([v.split(':')[0] for v in self.urls]).value_counts())
        print()

    def __init__(self):
        self.loc = 'query_result.csv'
        self.urls = self.imp_csv()


e = Explore()
# e.initial_cnt()
e.check_bad()
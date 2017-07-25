"""take in a shape file, RM polygons, create geojson with all other props in it"""
#TODO: autounzip

from json import dumps
import shapefile

def trans(loc):
    """https://gist.github.com/frankrowe/6071443"""
    reader = shapefile.Reader(loc)
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    buffer = []

    for sr in reader.shapeRecords():
       atr = dict(zip(field_names, sr.record))
       # geom = sr.shape.__geo_interface__
       buffer.append(dict(type="Feature", properties=atr))

    geojson = open("/Users/ewanog/Desktop/phl_adm2.json", "w")
    geojson.write(dumps({"type": "FeatureCollection", "features": buffer}, indent=2) + "\n")
    geojson.close()

if __name__ == '__main__':
    trans('/Users/ewanog/Downloads/phl2/PHL_adm2_PSA_pn_2016June')

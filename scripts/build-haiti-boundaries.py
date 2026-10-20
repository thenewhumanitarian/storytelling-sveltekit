#!/usr/bin/env python3
"""Pin/simplify CNIGS/OCHA HDX polygons; requires Shapely. No incident relocation.
Usage: python scripts/build-haiti-boundaries.py /path/to/hti_admin_boundaries.geojson.zip
"""
import sys,json,zipfile,hashlib
from pathlib import Path
from shapely.geometry import shape,mapping
ROOT=Path(__file__).resolve().parents[1]
archive=Path(sys.argv[1]); z=zipfile.ZipFile(archive)
out=ROOT/'static/data/haiti';out.mkdir(parents=True,exist_ok=True)
provenance=dict(dataset='https://data.humdata.org/dataset/cod-ab-hti',resource='https://data.humdata.org/dataset/777e8b06-337f-4295-80bc-ca1515244215/resource/1d89a0d5-897d-4c83-ab37-f363a0dca850/download/hti_admin_boundaries.geojson.zip',downloaded='2026-10-20',sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),attribution='CNIGS / OCHA, via HDX',license='CC BY-IGO',version='v01',toleranceDegrees=0.00015,coordinateDecimals=5,levels={})
def rounded(value):
    if isinstance(value,(tuple,list)):return [rounded(x) for x in value]
    return round(value,5)
for level in (2,3):
    data=json.loads(z.read(f'hti_admin{level}.geojson'));features=[];labels=[]
    for f in data['features']:
        p=f['properties'];g=mapping(shape(f['geometry']).simplify(0.00015,preserve_topology=True))
        features.append(dict(type='Feature',properties=dict(name=p[f'adm{level}_name1'] or p[f'adm{level}_name'],code=p[f'adm{level}_pcode'],commune=p.get('adm2_name1'),department=p['adm1_name1']),geometry=dict(type=g['type'],coordinates=rounded(g['coordinates']))))
        labels.append(dict(type='Feature',properties=features[-1]['properties'],geometry=dict(type='Point',coordinates=[p['center_lon'],p['center_lat']])))
    (out/f'admin{level}-labels.geojson').write_text(json.dumps(dict(type='FeatureCollection',features=labels),ensure_ascii=False,separators=(',',':'))+'\n')
    target=out/f'admin{level}.geojson';target.write_text(json.dumps(dict(type='FeatureCollection',features=features),ensure_ascii=False,separators=(',',':'))+'\n')
    provenance['levels'][str(level)]=dict(features=len(features),bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest())
(out/'boundaries-metadata.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(provenance)

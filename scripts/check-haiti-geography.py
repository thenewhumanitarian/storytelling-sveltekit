#!/usr/bin/env python3
"""Compare display points with original HDX polygons. Requires Shapely.
Usage: python scripts/check-haiti-geography.py BOUNDARIES.zip PRIVATE_REPORT.json
No points or place names are repaired; all discrepancies are for editorial review.
"""
import csv,json,sys,zipfile,unicodedata
from pathlib import Path
from shapely.geometry import shape,Point
ROOT=Path(__file__).resolve().parents[1]
out=Path(sys.argv[2]).resolve()
if ROOT==out or ROOT in out.parents:raise ValueError('Keep the review report outside the repository')
z=zipfile.ZipFile(sys.argv[1]);polygons=[(f['properties'],shape(f['geometry'])) for f in json.loads(z.read('hti_admin3.geojson'))['features']]
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if not unicodedata.combining(c)).replace('-',' ').strip()
report=[]
for r in csv.DictReader((ROOT/'src/lib/data/haiti-map/haiti-incidents-fallback.csv').open()):
    if r['type']!='incident' or not r['latitude']:continue
    point=Point(float(r['longitude']),float(r['latitude']));matches=[p for p,g in polygons if g.covers(point)]
    report.append(dict(publicId=int(r['id']),providedCommune=r['commune'],providedSection=r['sectionCommunale'],boundaryMatches=[dict(commune=p['adm2_name1'],section=p['adm3_name1']) for p in matches],communeMatches=any(norm(p['adm2_name1'])==norm(r['commune']) for p in matches),sectionMatches=any(norm(p['adm3_name1'])==norm(r['sectionCommunale']) for p in matches)))
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');out.chmod(0o600)
print(json.dumps(dict(located=len(report),outsideBoundary=sum(not r['boundaryMatches'] for r in report),communeMismatch=sum(not r['communeMatches'] for r in report),sectionMismatch=sum(not r['sectionMatches'] for r in report))))

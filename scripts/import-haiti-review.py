#!/usr/bin/env python3
"""Build public display records from private inputs. Never reads or writes Google Sheets.

Usage: python3 scripts/import-haiti-review.py --source CSV --private-dir DIR
Only the supplied 2025 source is imported. DIR must contain current-feed-baseline.csv
and display-drafts-2025.json.
Keep DIR outside the checkout. The durable ID map and reconciliation stay private.
"""
import argparse,csv,json,re,hashlib,os
from pathlib import Path
from datetime import datetime

ROOT=Path(__file__).resolve().parents[1]
FIELDS=['schemaVersion','id','type','date','droneCount','latitude','longitude','titleEN','titleFR','descriptionEN','descriptionFR','department','commune','sectionCommunale','locality','dateStatus','locationStatus','languageStatus','reviewStatus']

def numeric(value):
    raw=str(value or '').strip()
    return float(raw) if re.fullmatch(r'-?\d+(\.\d+)?',raw) else None

def display_date(raw,source=False):
    try:
        date=datetime.strptime(raw,'%d/%m/%Y' if source else '%Y-%m-%d')
        return date.strftime('%Y-%m-%d') if date.year in (2025,2026) else ''
    except ValueError: return ''

def write_private(path,data):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True,type=Path)
    parser.add_argument('--private-dir',required=True,type=Path)
    args=parser.parse_args(); private=args.private_dir.resolve()
    if private==ROOT or ROOT in private.parents: raise ValueError('Evidence must stay outside the repository')
    private.mkdir(parents=True,exist_ok=True);private.chmod(0o700)
    old=list(csv.DictReader((private/'current-feed-baseline.csv').open()))
    revised=list(csv.DictReader(args.source.open()))
    drafts25={d['sourceRow']:d for d in json.loads((private/'display-drafts-2025.json').read_text())}
    old_by_source={r['identifiant']:r for r in old if r['identifiant']}
    id_path=private/'public-id-map.json'
    identities=json.loads(id_path.read_text()) if id_path.exists() else {r['identifiant']:int(float(r['id'])) for r in old if r['identifiant']}
    next_id=max([int(float(r['id'])) for r in old]+list(identities.values()))+1
    public=[];audit=[];seen=set()
    def make_record(r,draft,id,date,lat,lon,count):
        located=lat is not None and lon is not None and 18<=lat<=20.2 and -74.6<=lon<=-71.5
        locality=r.get('locality') or r.get('Localité','')
        commune=r.get('commune') or r.get('Comune','')
        place=locality or commune or 'Haïti'
        return dict(schemaVersion='haiti-display-v1',id=id,type='incident',date=date,droneCount=count,
            latitude=lat if located else '',longitude=lon if located else '',
            titleEN=place,titleFR=place,descriptionEN=draft['descriptionEN'],descriptionFR=draft['descriptionFR'],
            department=r.get('department') or r.get('Département',''),commune=commune,
            sectionCommunale=r.get('sectionCommunale') or r.get('Section Communale',''),locality=locality,
            dateStatus='recorded' if date else 'pending',locationStatus='locality' if located else 'pending',
            languageStatus='editorial-draft',reviewStatus='provisional')
    for row,r in enumerate(revised,2):
        if not r['Date'].strip(): continue
        draft=drafts25[row];source_id=r['Identifiant']
        if draft['sourceId']!=source_id: raise ValueError('Draft join mismatch')
        key=source_id if source_id and source_id!='our data' else f'2025-source-row:{row}'
        if key not in identities: identities[key]=next_id;next_id+=1
        if key in seen: raise ValueError('Duplicate source identity')
        seen.add(key)
        count=numeric(r['Nombre de drones'])
        if count is not None and (not count.is_integer() or count<0): raise ValueError('Invalid drone count')
        record=make_record(r,draft,identities[key],display_date(r['Date'],True),numeric(r['X']),numeric(r['Y']),int(count) if count is not None else '')
        public.append(record)
        prior=old_by_source.get(source_id)
        audit.append(dict(publicId=record['id'],sourceRow=row,sourceId=source_id,original=r,
            disposition='matched' if prior else 'added',previous=prior,displayDraft=draft,
            datePending=not bool(record['date']),locationPending=record['locationStatus']=='pending'))
    if len(public)!=190 or len(audit)!=190: raise ValueError('Unexpected 2025 source cardinality')
    if len(set(str(r['id']) for r in public))!=len(public): raise ValueError('Duplicate public ID')
    public.sort(key=lambda r:(r['date'] or '9999',int(float(r['id']))))
    output=ROOT/'src/lib/data/haiti-map/haiti-incidents-fallback.csv'
    with output.open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS,lineterminator='\n');writer.writeheader();writer.writerows(public)
    write_private(id_path,identities)
    write_private(private/'reconciliation-2025-only.json',dict(sourceSha256=hashlib.sha256(args.source.read_bytes()).hexdigest(),scope='2025-source-only',records=audit))
    print(json.dumps(dict(publicRecords=len(public),incidents=len(audit),knownDrones=sum(int(r['droneCount'] or 0) for r in public),unknownCounts=sum(r['type']=='incident' and r['droneCount']=='' for r in public),unlocated=sum(r['type']=='incident' and r['locationStatus']=='pending' for r in public),undated=sum(not r['date'] for r in public))))

if __name__=='__main__':main()

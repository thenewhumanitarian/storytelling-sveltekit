#!/usr/bin/env python3
"""Append a reviewed 2026 XLSX selection to the existing 2025 display snapshot.

Requires openpyxl. Keep the source, drafts and reconciliation outside the checkout.
Red source rows are excluded; missing narratives remain explicitly pending.
No source identifiers, evidence notes or source attribution enter the public CSV.
"""
import argparse
import csv
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
REDACTED_FILL = 'FFF4CCCC'


def write_private(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    path.chmod(0o600)


def place(value):
    # The source has an alternative-location annotation naming a confidential contributor.
    text = str(value or '').strip()
    return re.sub(r'\s*\([^)]*\b(?:INSO|ACLED)\b[^)]*\)', '', text, flags=re.I).strip()


def numeric(value):
    try:
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--private-dir', required=True, type=Path)
    args = parser.parse_args()
    private = args.private_dir.resolve()
    if private == ROOT or ROOT in private.parents:
        raise ValueError('Private evidence must stay outside the checkout')
    private.mkdir(parents=True, exist_ok=True)
    private.chmod(0o700)
    snapshot = ROOT / 'src/lib/data/haiti-map/haiti-incidents-fallback.csv'
    baseline = private / '2025-display-baseline.csv'
    if not baseline.exists():
        baseline.write_bytes(snapshot.read_bytes())
        baseline.chmod(0o600)
    with baseline.open() as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        retained = list(reader)
    if len(retained) != 190 or any(r['date'] and not r['date'].startswith('2025-') for r in retained):
        raise ValueError('Expected the preserved 190-record 2025 selection')
    drafts = {}
    for part in (1, 2):
        for draft in json.loads((private / f'display-drafts-2026-part{part}.json').read_text()):
            if draft['sourceRow'] in drafts:
                raise ValueError('Duplicate draft join')
            drafts[draft['sourceRow']] = draft
    id_path = private / '2026-public-id-map.json'
    identities = json.loads(id_path.read_text()) if id_path.exists() else {}
    previous_ids = json.loads((private.parent / '2026-10-20/public-id-map.json').read_text())
    next_id = max([int(r['id']) for r in retained] + list(previous_ids.values()) + list(identities.values())) + 1
    sheet = openpyxl.load_workbook(args.source, data_only=True)['Sheet1']
    if [sheet.cell(1, c).value for c in range(1, 5)] != ['RS fact-checking notes', 'Narratif', '# drones', 'Date']:
        raise ValueError('Unexpected source headers')
    excluded = []
    audit = []
    added = []
    for cells in sheet.iter_rows(min_row=2):
        values = [cell.value for cell in cells]
        if not isinstance(values[3], datetime) or values[3].year != 2026:
            continue
        row = cells[0].row
        if any(c.fill.fgColor.type == 'rgb' and c.fill.fgColor.rgb == REDACTED_FILL for c in cells[:10]):
            excluded.append(row)
            continue
        draft = drafts.get(row)
        if values[1] and not draft:
            raise ValueError(f'Missing reviewed narrative for row {row}')
        if not values[1]:
            draft = dict(descriptionEN='This entry is included for provisional review. Its incident narrative is awaiting completion.', descriptionFR='Cette entrée est incluse pour examen provisoire. Le récit de l’incident reste à compléter.')
        date = values[3].date().isoformat()
        key = hashlib.sha256(json.dumps([row, date, values[1], values[7]], ensure_ascii=False).encode()).hexdigest()
        if key not in identities:
            identities[key] = next_id
            next_id += 1
        count = numeric(values[2])
        if values[2] is not None and (count is None or not count.is_integer() or count < 0):
            raise ValueError(f'Unreviewed structured count at row {row}')
        latitude, longitude = numeric(values[8]), numeric(values[9])
        located = latitude is not None and longitude is not None and 18 <= latitude <= 20.2 and -74.6 <= longitude <= -71.5
        locality, commune = place(values[7]), place(values[5])
        record = dict(schemaVersion='haiti-display-v1', id=identities[key], type='incident', date=date,
            droneCount=int(count) if count is not None else '', latitude=latitude if located else '', longitude=longitude if located else '',
            titleEN=locality or commune or 'Haiti', titleFR=locality or commune or 'Haïti',
            descriptionEN=draft['descriptionEN'], descriptionFR=draft['descriptionFR'],
            department=place(values[4]), commune=commune, sectionCommunale=place(values[6]), locality=locality,
            dateStatus='recorded', locationStatus='locality' if located else 'pending', languageStatus='editorial-draft', reviewStatus='provisional')
        public_text = json.dumps(record, ensure_ascii=False)
        if re.search(r'\b(?:INSO|ACLED|GCO|killed|wounded|injured|fatalities|casualties|tu[ée]s?|bless[ée]s?|morts?)\b|hti:|HTI\d', public_text, re.I):
            raise ValueError(f'Unreviewed public text at row {row}')
        added.append(record)
        audit.append(dict(sourceRow=row, publicId=record['id'], key=key, narrativePending=not bool(values[1]), locationPending=not located, unknownCount=count is None))
    if len(added) != 263 or len(excluded) != 22 or sum(r['narrativePending'] for r in audit) != 9:
        raise ValueError('Source selection changed; review before importing')
    records = retained + added
    records.sort(key=lambda r: (r['date'] or '9999', int(r['id'])))
    if len({int(r['id']) for r in records}) != len(records):
        raise ValueError('Duplicate public identity')
    with snapshot.open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows(records)
    write_private(id_path, identities)
    write_private(private / 'reconciliation.json', dict(sourceSha256=hashlib.sha256(args.source.read_bytes()).hexdigest(), excludedRedRows=excluded, retained2025=190, records2026=audit))
    print(json.dumps(dict(records=len(records), new2026=len(added), redExcluded=len(excluded), narrativePending=9, knownDrones=sum(int(r['droneCount'] or 0) for r in records), unknownCounts=sum(r['droneCount'] == '' for r in records), unlocated=sum(r['locationStatus'] == 'pending' for r in records), undated=sum(not r['date'] for r in records))))


if __name__ == '__main__':
    main()

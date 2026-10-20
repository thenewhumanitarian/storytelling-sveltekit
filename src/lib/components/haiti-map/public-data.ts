import { parse } from 'csv-parse/sync';
import { normaliseHaitiDate } from './dates.ts';
import type { IncidentData } from './types.ts';

export const HAITI_PUBLIC_SCHEMA = 'haiti-display-v1';
export const HAITI_FEED_URL =
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7SHGjPbXZaoyndaUg_Zax9Q2q3rTzYikzDXk8pc7GMkDhu1UsUOwk150_xMxpudr3A2vHjVndc9-x/pub?gid=0&single=true&output=csv';
export const PUBLIC_FIELDS = [
	'schemaVersion',
	'id',
	'type',
	'date',
	'droneCount',
	'latitude',
	'longitude',
	'titleEN',
	'titleFR',
	'descriptionEN',
	'descriptionFR',
	'department',
	'commune',
	'sectionCommunale',
	'locality',
	'dateStatus',
	'locationStatus',
	'languageStatus',
	'reviewStatus'
] as const;

function text(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}
function number(value: unknown): number | undefined {
	if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
	const raw = text(value);
	return /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : undefined;
}

/** Only editorial display records cross this boundary; raw evidence is never spread into output. */
export function projectPublicRecords(records: Record<string, unknown>[]): IncidentData[] {
	const ids = new Set<number>();
	const projected = records.map((record): IncidentData => {
		if (record.schemaVersion !== HAITI_PUBLIC_SCHEMA)
			throw new Error('Haiti feed needs the reviewed display schema');
		const id = number(record.id);
		if (id == null || !Number.isSafeInteger(id) || id < 1 || ids.has(id))
			throw new Error('Invalid or duplicate Haiti display ID');
		ids.add(id);
		if (record.type !== 'incident' && record.type !== 'event')
			throw new Error('Invalid Haiti record type');
		const date = normaliseHaitiDate(text(record.date));
		if ((!date || !/^202[56]-/.test(date)) && record.dateStatus !== 'pending')
			throw new Error('Haiti date needs review');
		const latitude = number(record.latitude);
		const longitude = number(record.longitude);
		const located =
			latitude != null &&
			longitude != null &&
			latitude >= 18 &&
			latitude <= 20.2 &&
			longitude >= -74.6 &&
			longitude <= -71.5;
		if (!located && record.locationStatus !== 'pending' && record.type === 'incident')
			throw new Error('Haiti coordinates need review');
		const count = number(record.droneCount);
		if (count != null && (!Number.isSafeInteger(count) || count < 0))
			throw new Error('Invalid Haiti drone count');
		if (text(record.droneCount) && record.droneCount !== 'unknown' && count == null)
			throw new Error('Invalid Haiti count text');
		const titleEN = text(record.titleEN);
		const titleFR = text(record.titleFR);
		const descriptionEN = text(record.descriptionEN);
		const descriptionFR = text(record.descriptionFR);
		if (!titleEN || !titleFR || !descriptionEN || !descriptionFR)
			throw new Error('Haiti display text is incomplete');
		return {
			schemaVersion: HAITI_PUBLIC_SCHEMA,
			id,
			type: record.type,
			date: date && /^202[56]-/.test(date) ? date : '',
			droneCount: record.type === 'incident' ? (count ?? null) : null,
			latitude: located ? latitude : undefined,
			longitude: located ? longitude : undefined,
			titleEN,
			titleFR,
			descriptionEN,
			descriptionFR,
			title: titleEN,
			description: descriptionEN,
			department: text(record.department),
			commune: text(record.commune),
			sectionCommunale: text(record.sectionCommunale),
			locality: text(record.locality),
			dateStatus: date && /^202[56]-/.test(date) ? 'recorded' : 'pending',
			locationStatus: located ? 'locality' : 'pending',
			languageStatus: 'editorial-draft',
			reviewStatus: 'provisional',
			chronoId: 0,
			weekYear: ''
		};
	});
	projected.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.id - b.id);
	return projected.map((record, chronoId) => ({ ...record, chronoId }));
}

export function parsePublicCsv(csv: string): IncidentData[] {
	if (csv.includes('\uFFFD') || /^\s*</.test(csv)) throw new Error('Invalid Haiti CSV response');
	const records = parse<Record<string, unknown>>(csv, {
		columns: true,
		trim: true,
		skip_empty_lines: true
	});
	if (!records.length) throw new Error('Empty Haiti feed');
	return projectPublicRecords(records);
}

export function publicCsv(records: IncidentData[]): string {
	const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
	return (
		[
			PUBLIC_FIELDS.join(','),
			...records.map((record) => PUBLIC_FIELDS.map((field) => escape(record[field])).join(','))
		].join('\n') + '\n'
	);
}

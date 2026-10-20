import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
	parsePublicCsv,
	projectPublicRecords,
	publicCsv
} from '../src/lib/components/haiti-map/public-data.ts';
import { parseHaitiReview } from '../src/lib/components/haiti-map/review-data.ts';
import { summariseIncidents } from '../src/lib/components/haiti-map/data.ts';
const fixture = {
	schemaVersion: 'haiti-display-v1',
	id: '1',
	type: 'incident',
	date: '2025-03-01',
	dateStatus: 'recorded',
	droneCount: 'unknown',
	latitude: '18.54',
	longitude: '-72.33',
	titleEN: 'Delmas',
	titleFR: 'Delmas',
	descriptionEN: 'A drone operation was reported.',
	descriptionFR: 'Une opération de drone a été signalée.'
};
test('public boundary strips evidence, provider IDs and casualty fields from every record', () => {
	const [record] = projectPublicRecords([
		{
			...fixture,
			sources: 'PRIVATE_SENTINEL',
			identifiant: 'PRIVATE_SENTINEL',
			killed: 5,
			wounded: 2,
			unexpected: 'PRIVATE_SENTINEL'
		}
	]);
	assert.equal(record.droneCount, null);
	for (const key of ['sources', 'identifiant', 'killed', 'wounded', 'unexpected'])
		assert.equal(key in record, false);
	assert.equal(JSON.stringify(record).includes('PRIVATE_SENTINEL'), false);
	assert.throws(() => projectPublicRecords([{ ...fixture, schemaVersion: '' }]), /display schema/);
});
test('pending date and location reports remain in overall totals without invented placements', () => {
	const records = projectPublicRecords([
		{
			...fixture,
			droneCount: '2',
			date: '2925-03-09',
			dateStatus: 'pending',
			latitude: '185443',
			locationStatus: 'pending'
		},
		{ ...fixture, id: '2' },
		{ ...fixture, id: '3', type: 'event', droneCount: '400' }
	]);
	assert.equal(records.length, 3);
	assert.equal(records.at(-1).date, '');
	assert.equal(records.at(-1).latitude, undefined);
	assert.deepEqual(summariseIncidents(records), {
		incidentCount: 2,
		knownDrones: 2,
		unknownCount: 1,
		unlocatedCount: 1,
		undatedCount: 1
	});
	assert.throws(() => projectPublicRecords([{ ...fixture, droneCount: '2 drones' }]), /count text/);
	assert.throws(() => projectPublicRecords([fixture, fixture]), /duplicate/);
	assert.throws(() => projectPublicRecords([{ ...fixture, latitude: '18,544' }]), /coordinates/);
});
test('selected 2025 fixture reconciles and round trips without changing null counts or IDs', () => {
	const records = parsePublicCsv(
		fs.readFileSync(
			new URL('../src/lib/data/haiti-map/haiti-incidents-fallback.csv', import.meta.url),
			'utf8'
		)
	);
	assert.equal(records.length, 190);
	assert.deepEqual(summariseIncidents(records), {
		incidentCount: 190,
		knownDrones: 392,
		unknownCount: 20,
		unlocatedCount: 12,
		undatedCount: 1
	});
	assert.deepEqual(parsePublicCsv(publicCsv(records)), records);
	assert.ok(records.every((r) => r.type === 'incident' && (!r.date || r.date.startsWith('2025-'))));
	const text = records
		.map((r) => [r.titleEN, r.titleFR, r.descriptionEN, r.descriptionFR].join(' '))
		.join('\n');
	assert.doesNotMatch(text, /\b(killed|wounded|injured|tu[ée]s?|bless[ée]s?|morts?|INSO|GCO)\b/i);
});

test('review scope rejects other years and context events while retaining the undated source report', () => {
	assert.equal(
		parseHaitiReview(
			publicCsv(projectPublicRecords([{ ...fixture, date: '', dateStatus: 'pending' }]))
		).length,
		1
	);
	for (const extra of [
		{ ...fixture, date: '2026-01-01' },
		{ ...fixture, type: 'event' }
	]) {
		assert.throws(
			() => parseHaitiReview(publicCsv(projectPublicRecords([extra]))),
			/selected 2025/
		);
	}
});

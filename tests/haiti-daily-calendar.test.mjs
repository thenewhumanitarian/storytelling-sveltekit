import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDailyCalendar } from '../src/lib/components/haiti-map/daily-calendar.ts';
import { parseHaitiReview } from '../src/lib/components/haiti-map/review-data.ts';
const records = parseHaitiReview(
	fs.readFileSync(
		new URL('../src/lib/data/haiti-map/haiti-incidents-fallback.csv', import.meta.url),
		'utf8'
	)
).filter((record) => !record.date || record.date.startsWith('2025-'));
test('daily calendar keeps consecutive dates in Monday–Sunday rows across month and year boundaries', () => {
	const { days, weeks, months } = buildDailyCalendar(records);
	assert.equal(days[0].date, '2025-03-01');
	assert.equal(days.at(-1).date, '2025-12-31');
	assert.equal(days.length, 306);
	assert.equal(weeks, 45);
	assert.equal(months.length, 10);
	assert.equal(days[0].row, 5);
	assert.equal(days.find((day) => day.date === '2025-03-03').row, 0);
	assert.equal(
		days.reduce((sum, day) => sum + day.incidentCount, 0),
		189
	);
	assert.equal(days.filter((day) => day.incidentCount).length, 110);
});
test('busy days link to their first card and preserve unknown counts rather than treating them as zero', () => {
	const { days } = buildDailyCalendar(records);
	const busy = days.find((day) => day.date === '2025-08-31');
	assert.equal(busy.incidentCount, 6);
	assert.equal(busy.knownDrones, 13);
	assert.equal(busy.unknownCount, 2);
	assert.equal(busy.firstChronoId, records.find((record) => record.date === busy.date).chronoId);
	const empty = days.find((day) => !day.incidentCount);
	assert.equal(empty.firstChronoId, null);
	const unknown = days.find((day) => day.incidentCount && day.unknownCount === day.incidentCount);
	assert.ok(unknown);
	assert.ok(unknown.firstChronoId !== null);
	assert.deepEqual(buildDailyCalendar([]), { days: [], weeks: 0, months: [] });
});

// Keep year-boundary placement independent of the editorial snapshot's final coverage.
test('daily calendar places the new year consecutively without merging matching months across years', () => {
	const sample = [
		{ ...records[0], date: '2025-12-31', chronoId: 1 },
		{ ...records[0], date: '2026-01-01', chronoId: 2 }
	];
	const { days, weeks, months } = buildDailyCalendar(sample);
	assert.deepEqual(
		days.map(({ date, column, row }) => ({ date, column, row })),
		[
			{ date: '2025-12-31', column: 0, row: 2 },
			{ date: '2026-01-01', column: 0, row: 3 }
		]
	);
	assert.equal(weeks, 1);
	assert.deepEqual(
		months.map((month) => month.date),
		['2025-12-31', '2026-01-01']
	);
	assert.equal(days[1].firstChronoId, 2);
});

test('combined review calendar covers both years through the final retained 2026 date', () => {
	const all = parseHaitiReview(
		fs.readFileSync(
			new URL('../src/lib/data/haiti-map/haiti-incidents-fallback.csv', import.meta.url),
			'utf8'
		)
	);
	const { days, weeks, months } = buildDailyCalendar(all);
	assert.equal(days[0].date, '2025-03-01');
	assert.equal(days.at(-1).date, '2026-08-17');
	assert.equal(days.length, 535);
	assert.equal(weeks, 78);
	assert.equal(months.length, 18);
	assert.equal(
		days.reduce((sum, day) => sum + day.incidentCount, 0),
		all.filter((record) => record.date).length
	);
});

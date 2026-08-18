import assert from 'node:assert/strict';
import test from 'node:test';
import { utcWeek } from 'd3-time';
import {
	formatHaitiDate,
	normaliseHaitiDate,
	parseHaitiDate
} from '../src/lib/components/haiti-map/dates.ts';

test('normalises and formats published Haiti event dates in both languages', () => {
	assert.equal(normaliseHaitiDate('2025-05-18'), '2025-05-18');
	assert.equal(formatHaitiDate('2025-05-18', 'en'), '18 May 2025');
	assert.equal(formatHaitiDate('2025-05-18', 'fr'), '18 mai 2025');
	assert.equal(normaliseHaitiDate('2025-02-30'), null);
	assert.equal(normaliseHaitiDate('02/30/2025'), null);
	assert.equal(normaliseHaitiDate('3/1/25'), null);
});

test('canonical dates are stable across runtime timezones', () => {
	const originalTimezone = process.env.TZ;
	try {
		for (const timezone of ['Africa/Johannesburg', 'America/New_York']) {
			process.env.TZ = timezone;
			assert.equal(normaliseHaitiDate('2025-03-01'), '2025-03-01');
			assert.equal(formatHaitiDate('2025-03-01', 'en'), '01 March 2025');
			assert.equal(
				utcWeek.floor(parseHaitiDate('2025-05-18')).toISOString(),
				'2025-05-18T00:00:00.000Z'
			);
		}
	} finally {
		process.env.TZ = originalTimezone;
	}
});

test('canonical dates sort in ascending timeline order', () => {
	const dates = ['2026-01-12', '2025-05-18', '2025-08-19', '2026-01-01'];
	const sorted = dates
		.map((date) => normaliseHaitiDate(date))
		.filter((date) => date !== null)
		.sort((a, b) => Date.parse(a) - Date.parse(b));

	assert.deepEqual(sorted, ['2025-05-18', '2025-08-19', '2026-01-01', '2026-01-12']);
});

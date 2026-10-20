#!/usr/bin/env node
import fs from 'node:fs';
import { parseHaitiReview } from '../src/lib/components/haiti-map/review-data.ts';
import { buildDailyCalendar } from '../src/lib/components/haiti-map/daily-calendar.ts';
import { summariseIncidents } from '../src/lib/components/haiti-map/data.ts';
const records = parseHaitiReview(
	fs.readFileSync(
		new URL('../src/lib/data/haiti-map/haiti-incidents-fallback.csv', import.meta.url),
		'utf8'
	)
);
// Label aliases are for analysis only; preserve the supplied display data.
const communeAliases = {
	'POrt-au-Prince': 'Port-au-Prince',
	'Croix Des Bouquets': 'Croix-Des-Bouquets'
};
const localityAliases = { 'Carrefour Feuilles': 'Carrefour-Feuilles' };
function aggregate(key, subset = records) {
	const groups = new Map();
	for (const record of subset) {
		const label = key(record);
		const group = groups.get(label) ?? [];
		group.push(record);
		groups.set(label, group);
	}
	return [...groups]
		.map(([label, rows]) => ({
			label,
			...summariseIncidents(rows),
			activeDays: new Set(rows.map((row) => row.date).filter(Boolean)).size,
			firstDate: rows.find((row) => row.date)?.date ?? null,
			lastDate: rows.findLast((row) => row.date)?.date ?? null
		}))
		.sort((a, b) => b.incidentCount - a.incidentCount || b.knownDrones - a.knownDrones);
}
const calendar = buildDailyCalendar(records);
const dayRanks = calendar.days
	.filter((day) => day.incidentCount)
	.sort((a, b) => b.incidentCount - a.incidentCount || b.knownDrones - a.knownDrones);
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
	(label, row) => {
		const days = calendar.days.filter((day) => day.row === row);
		return {
			label,
			observedCalendarDays: days.length,
			activeDays: days.filter((day) => day.incidentCount).length,
			incidentCount: days.reduce((sum, day) => sum + day.incidentCount, 0),
			knownDrones: days.reduce((sum, day) => sum + day.knownDrones, 0),
			unknownCount: days.reduce((sum, day) => sum + day.unknownCount, 0)
		};
	}
);
console.log(
	JSON.stringify(
		{
			scope: '2025 source only; editorial review, not publication claims',
			summary: summariseIncidents(records),
			activeDays: dayRanks.length,
			months: aggregate((record) => record.date.slice(0, 7) || 'Undated').sort((a, b) =>
				a.label.localeCompare(b.label)
			),
			communes: aggregate((record) => communeAliases[record.commune] ?? record.commune),
			localities: aggregate((record) => localityAliases[record.locality] ?? record.locality),
			busiestDays: dayRanks.slice(0, 10),
			highestRecordedCountDays: [...dayRanks]
				.sort((a, b) => b.knownDrones - a.knownDrones)
				.slice(0, 10),
			weekdays,
			highestRecordedCountIncidents: [...records]
				.sort((a, b) => (b.droneCount ?? 0) - (a.droneCount ?? 0))
				.slice(0, 10)
				.map(({ date, locality, commune, droneCount }) => ({ date, locality, commune, droneCount }))
		},
		null,
		2
	)
);

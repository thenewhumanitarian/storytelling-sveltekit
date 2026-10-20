import type { IncidentData } from './types.ts';
import { parseHaitiDate } from './dates.ts';

const DAY = 86_400_000;
export interface CalendarDay {
	date: string;
	column: number;
	row: number;
	incidentCount: number;
	knownDrones: number;
	unknownCount: number;
	firstChronoId: number | null;
}

export function buildDailyCalendar(records: IncidentData[]) {
	const dated = records
		.filter((record) => record.type === 'incident' && parseHaitiDate(record.date))
		.sort((a, b) => a.date.localeCompare(b.date) || a.chronoId - b.chronoId);
	if (!dated.length)
		return {
			days: [] as CalendarDay[],
			weeks: 0,
			months: [] as { date: string; column: number }[]
		};
	const start = parseHaitiDate(dated[0].date)!;
	const end = parseHaitiDate(dated.at(-1)!.date)!;
	const monday = start.getTime() - ((start.getUTCDay() + 6) % 7) * DAY;
	const byDate = new Map<string, IncidentData[]>();
	for (const record of dated) {
		const group = byDate.get(record.date) ?? [];
		group.push(record);
		byDate.set(record.date, group);
	}
	const days: CalendarDay[] = [];
	const months: { date: string; column: number }[] = [];
	for (let time = start.getTime(); time <= end.getTime(); time += DAY) {
		const date = new Date(time).toISOString().slice(0, 10);
		const group = byDate.get(date) ?? [];
		const offset = (time - monday) / DAY;
		const column = Math.floor(offset / 7);
		days.push({
			date,
			column,
			row: offset % 7,
			incidentCount: group.length,
			knownDrones: group.reduce((sum, record) => sum + (record.droneCount ?? 0), 0),
			unknownCount: group.filter((record) => record.droneCount == null).length,
			firstChronoId: group[0]?.chronoId ?? null
		});
		if (time === start.getTime() || date.endsWith('-01')) months.push({ date, column });
	}
	return { days, weeks: Math.floor((end.getTime() - monday) / DAY / 7) + 1, months };
}

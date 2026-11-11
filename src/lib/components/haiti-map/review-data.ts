import { parsePublicCsv } from './public-data.ts';

/** This review edition is pinned to the selected 2025 and provisional 2026 snapshot, including undated reports. */
export function parseHaitiReview(csv: string) {
	const records = parsePublicCsv(csv);
	if (
		records.some(
			(record) => record.type !== 'incident' || (record.date && !/^202[56]-/.test(record.date))
		)
	) {
		throw new Error('Haiti review accepts only the selected 2025 and 2026 incidents');
	}
	return records;
}

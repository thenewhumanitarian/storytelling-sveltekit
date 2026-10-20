import { parsePublicCsv } from './public-data.ts';

/** This review edition is pinned to the supplied 2025 snapshot, including its undated report. */
export function parseHaitiReview(csv: string) {
	const records = parsePublicCsv(csv);
	if (
		records.some(
			(record) => record.type !== 'incident' || (record.date && !record.date.startsWith('2025-'))
		)
	) {
		throw new Error('Haiti review accepts only the selected 2025 incidents');
	}
	return records;
}

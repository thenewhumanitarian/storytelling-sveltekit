import reviewCsv from '$lib/data/haiti-map/haiti-incidents-fallback.csv?raw';
import { parseHaitiReview } from '$lib/components/haiti-map/review-data';
import { summariseIncidents } from '$lib/components/haiti-map/data';

export async function loadHaitiData() {
	// Keep staging and local review on the same selected source; a live feed may contain other years.
	const incidentsData = parseHaitiReview(reviewCsv);
	return {
		incidentsData,
		summary: summariseIncidents(incidentsData),
		dataSource: 'snapshot' as const
	};
}

import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import fallbackCsv from '$lib/data/haiti-map/haiti-incidents-fallback.csv?raw';
import cached from '$lib/data/haiti-map/cached-incidents.json';
import {
	HAITI_FEED_URL,
	parsePublicCsv,
	projectPublicRecords
} from '$lib/components/haiti-map/public-data';
import { summariseIncidents } from '$lib/components/haiti-map/data';

export async function loadHaitiData() {
	const production =
		!dev &&
		(privateEnv.VERCEL_ENV
			? privateEnv.VERCEL_ENV === 'production'
			: publicEnv.PUBLIC_BASE_URL?.includes('interactive.thenewhumanitarian.org'));
	let incidentsData;
	let dataSource: 'sheet' | 'snapshot' | 'fallback' = 'fallback';
	if (production) {
		try {
			incidentsData = projectPublicRecords(
				cached.incidentsData as unknown as Record<string, unknown>[]
			);
			dataSource = 'snapshot';
		} catch {
			/* A legacy cache must pass the same public boundary as a live feed. */
		}
	} else {
		try {
			const response = await fetch(HAITI_FEED_URL, {
				signal: AbortSignal.timeout(8000),
				cache: 'no-store'
			});
			if (!response.ok) throw new Error('Haiti feed unavailable');
			incidentsData = parsePublicCsv(await response.text());
			dataSource = 'sheet';
		} catch {
			console.warn('Haiti: using the sanitised local snapshot; live display feed unavailable.');
		}
	}
	incidentsData ??= parsePublicCsv(fallbackCsv);
	return { incidentsData, summary: summariseIncidents(incidentsData), dataSource };
}

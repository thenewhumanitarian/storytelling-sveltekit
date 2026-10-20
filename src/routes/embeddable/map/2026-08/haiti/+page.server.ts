import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { loadHaitiData } from '$lib/server/haiti-data';

export const load: PageServerLoad = async () => ({
	...(await loadHaitiData()),
	mapboxToken: env.PUBLIC_MAPBOX_TOKEN ?? ''
});

import type { PageServerLoad } from './$types';
import { loadHaitiData } from '$lib/server/haiti-data';
import { SHOW_HAITI_TOTALS } from '$lib/components/haiti-map/presentation';

export const load: PageServerLoad = async ({ url }) => {
	const summary = SHOW_HAITI_TOTALS ? (await loadHaitiData()).summary : null;
	return {
		lang: url.searchParams.get('lang') === 'fr' ? 'fr' : 'en',
		droneCount: summary?.knownDrones ?? 0,
		showDroneTotal: SHOW_HAITI_TOTALS
	};
};

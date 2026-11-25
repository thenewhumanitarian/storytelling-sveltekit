import { json } from '@sveltejs/kit';
import { climateDataService, climateReactor } from '$lib/server/climate';
import type { RequestHandler } from './$types';

const headers = { 'cache-control': 'no-store' };

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const service = climateDataService(fetch);
	if (service) {
		try {
			return json(await service.wall(climateReactor(cookies)), { headers });
		} catch {
			// The page can keep showing its last successful public entries.
		}
	}

	return json({ wall: [] }, { status: 503, headers });
};

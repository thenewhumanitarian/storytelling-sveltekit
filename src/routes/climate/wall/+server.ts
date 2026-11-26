import { json } from '@sveltejs/kit';
import { climateDataService, climateReactor, commentsOpen } from '$lib/server/climate';
import type { RequestHandler } from './$types';

const headers = { 'cache-control': 'no-store' };

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const service = climateDataService(fetch);
	if (service) {
		try {
			const [wall, commentsEnabled] = await Promise.all([
				service.wall(climateReactor(cookies)),
				commentsOpen(service)
			]);
			return json({ ...wall, commentsEnabled }, { headers });
		} catch {
			// The page can keep showing its last successful public entries.
		}
	}

	return json({ wall: [] }, { status: 503, headers });
};

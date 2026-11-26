import { json } from '@sveltejs/kit';
import { climateDataService } from '$lib/server/climate';
import type { RequestHandler } from './$types';

const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const headers = { 'cache-control': 'no-store' };

/** The published comments in one thought's thread, oldest first. */
export const GET: RequestHandler = async ({ params, fetch }) => {
	if (!uuid.test(params.id)) return json({ comments: [] }, { status: 400, headers });
	const service = climateDataService(fetch);
	if (!service) return json({ comments: [], unavailable: true }, { status: 503, headers });
	try {
		return json({ comments: await service.comments(params.id) }, { headers });
	} catch {
		return json({ comments: [], unavailable: true }, { status: 503, headers });
	}
};

import { json } from '@sveltejs/kit';
import { analyse, type WallTerm } from '$lib/server/climate-ai';
import { climateDataService } from '$lib/server/climate';
import type { RequestHandler } from './$types';

const headers = { 'cache-control': 'no-store' };
const windowMs = 10 * 60 * 1000;
const perWindow = 40;
// Per-instance throttle. It keeps one browser from burning the model quota; Supabase-backed
// limits still guard the actual submissions.
const recent = new Map<string, number[]>();

function allowed(address: string) {
	const now = Date.now();
	const hits = (recent.get(address) ?? []).filter((time) => now - time < windowMs);
	if (hits.length >= perWindow) return false;
	hits.push(now);
	recent.set(address, hits);
	if (recent.size > 5000) recent.clear();
	return true;
}

function clientWall(value: unknown): WallTerm[] {
	if (!Array.isArray(value)) return [];
	return value
		.slice(0, 80)
		.filter(
			(term): term is WallTerm =>
				Boolean(term) &&
				typeof term.id === 'string' &&
				term.id.length <= 64 &&
				typeof term.body === 'string' &&
				term.body.length <= 500
		)
		.map(({ id, body }) => ({ id, body }));
}

/** Suggest short phrasings for a public draft and spot thoughts already on the wall. */
export const POST: RequestHandler = async ({ request, fetch, getClientAddress }) => {
	const input: { text?: unknown; wall?: unknown; avoid?: unknown; screen?: unknown } = await request
		.json()
		.catch(() => ({}));
	const text = typeof input.text === 'string' ? input.text.trim() : '';
	if (text.length < 3 || text.length > 500) {
		return json({ suggestions: [], matches: [], blocked: false }, { headers });
	}
	if (!allowed(getClientAddress())) {
		return json({ suggestions: [], matches: [], blocked: false, limited: true }, { headers });
	}

	const avoid = Array.isArray(input.avoid)
		? input.avoid.filter((item): item is string => typeof item === 'string').slice(0, 9)
		: [];

	// The live wall comes from the database; the local preview sends its sample terms.
	const service = climateDataService(fetch);
	let wall: WallTerm[] = clientWall(input.wall);
	if (service) {
		try {
			wall = (await service.wall(null)).wall.map(({ id, body }) => ({ id, body }));
		} catch {
			wall = [];
		}
	}

	const result = await analyse(text, wall, avoid);
	return json(
		{
			suggestions: result.suggestions.filter((item) => item.toLowerCase() !== text.toLowerCase()),
			matches: result.matches,
			blocked: result.verdict === 'block',
			// The preview has no database, so it asks for the full verdict to mimic publishing.
			...(input.screen === true && !service
				? { verdict: result.verdict, term: result.term, reason: result.reason }
				: {})
		},
		{ headers }
	);
};

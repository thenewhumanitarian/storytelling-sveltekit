import { getEventSlugs } from '$lib/events/registry';

export const prerender = true;

export function entries() {
	return getEventSlugs().map((slug) => ({ slug }));
}

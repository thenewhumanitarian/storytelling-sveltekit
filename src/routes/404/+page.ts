import { error } from '@sveltejs/kit';

/** Explicit /404 route — renders root +error.svelte with NotFoundPage. */
export function load() {
	error(404, 'Not found');
}

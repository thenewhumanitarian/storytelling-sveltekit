import { error } from '@sveltejs/kit';
import { climateDataService } from '$lib/server/climate';
import { isAdmin } from '$lib/server/climate-admin';
import type { RequestHandler } from './$types';

const columns = [
	'id',
	'created_at',
	'visibility',
	'status',
	'topic',
	'body',
	'published_body',
	'moderation_verdict',
	'moderation_categories',
	'moderation_reason',
	'moderation_model',
	'moderation_term',
	'withdrawn_at',
	'reactions',
	'boosts'
] as const;

/** RFC 4180 quoting, plus a leading apostrophe on cells a spreadsheet would run as a formula. */
function cell(value: unknown) {
	let text = Array.isArray(value) ? value.join('; ') : value == null ? '' : String(value);
	if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
	return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	if (!isAdmin(cookies)) error(401, 'Log in at /climate/admin first.');
	const service = climateDataService(fetch);
	if (!service) error(503, 'The database isn’t configured.');

	let entries;
	try {
		entries = await service.admin.entries();
	} catch {
		error(503, 'Apply the climate admin migration (20261126090000_climate_admin.sql) first.');
	}
	const rows = [
		columns.join(','),
		...entries.map((entry) => columns.map((column) => cell(entry[column])).join(','))
	];
	const date = new Date().toISOString().slice(0, 10);
	// The byte-order mark makes Excel open the file as UTF-8.
	return new Response(`\uFEFF${rows.join('\r\n')}\r\n`, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="tnh-climate-entries-${date}.csv"`,
			'cache-control': 'private, no-store',
			'x-robots-tag': 'noindex, nofollow'
		}
	});
};

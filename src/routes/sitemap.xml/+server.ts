import { getBaseUrl } from '$lib/events/seo';
import { getEventSlugs } from '$lib/events/registry';

const STATIC_PATHS = [
	'/',
	'/events',
	'/stories/2026/03/24/india-assam-evictions-forced-displacement',
	'/stories/2025/05/22/lebanon-displacement-diaries/home'
];

export async function GET() {
	const base = getBaseUrl();
	const eventPaths = getEventSlugs().map((slug) => `/events/${slug}`);
	const paths = [...STATIC_PATHS, ...eventPaths];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) => `  <url>
    <loc>${base}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
}

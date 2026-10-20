import type { RequestHandler } from './$types';
import scriptSource from '$lib/components/haiti-map/spotlight-embed.js?raw';
import { SHOW_HAITI_TOTALS } from '$lib/components/haiti-map/presentation';

export const GET: RequestHandler = () =>
	new Response(
		SHOW_HAITI_TOTALS ? scriptSource : '/* Haiti headline counter paused for editorial review. */',
		{
			headers: {
				'content-type': 'application/javascript; charset=utf-8',
				'cache-control': SHOW_HAITI_TOTALS
					? 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60'
					: 'no-store'
			}
		}
	);

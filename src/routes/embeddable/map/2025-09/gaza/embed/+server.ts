import type { RequestHandler } from './$types';
import scriptSource from '$lib/components/gaza-map/embed-script.js?raw';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ request, url }) => {
    const body = scriptSource || '// embed script not found';

	// Fire-and-forget GA tracking if configured
	try {
		const measurementId = env.GA_MEASUREMENT_ID;
		const apiSecret = env.GA_API_SECRET;
		if (measurementId && apiSecret) {
			const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
			const ref = request.headers.get('referer') || '';
			const ua = request.headers.get('user-agent') || '';
            const clientId = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
                ? (globalThis.crypto as unknown as { randomUUID: () => string }).randomUUID()
                : Math.random().toString(36).slice(2);
			const payload = {
				client_id: clientId,
				events: [
					{
						name: 'embed_script_requested',
						params: {
							path: url.pathname,
							referrer: ref,
							user_agent: ua
						}
					}
				]
			};
			// Do not block response
            fetch(endpoint, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
            }).catch(() => {
                /* ignore analytics errors */
            });
		}
    } catch {
        /* ignore analytics errors */
    }

	return new Response(body, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60'
		}
	});
};

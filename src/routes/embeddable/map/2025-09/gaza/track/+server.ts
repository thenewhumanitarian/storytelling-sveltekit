import type { RequestHandler } from './$types'
import { env as privateEnv } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

export const config = {
	runtime: 'nodejs22.x',
	dynamic: 'force-dynamic'
}

export const POST: RequestHandler = async ({ request, url }) => {
	// Read payload if provided. Do not error if invalid JSON.
	let body: unknown = null
	try {
		body = await request.json()
	} catch {}

	// Minimal fields from headers
	const ref = request.headers.get('referer') || ''
	const ua = request.headers.get('user-agent') || ''

	// Fire-and-forget GA4 tracking if configured
	try {
		const measurementId = publicEnv.PUBLIC_GA4_ID || privateEnv.PUBLIC_GA4_ID
		const apiSecret = privateEnv.GA4_API_SECRET
		if (measurementId && apiSecret) {
			const base = privateEnv.GA_ENDPOINT || privateEnv.GA4_ENDPOINT || 'https://www.google-analytics.com'
			const endpoint = `${base}/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
			const clientId = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
				? (globalThis.crypto as unknown as { randomUUID: () => string }).randomUUID()
				: Math.random().toString(36).slice(2)

			const payload = {
				client_id: clientId,
				events: [
					{
						name: 'embed_viewed',
						params: {
							path: url.pathname,
							referrer: ref,
							user_agent: ua,
							page_location: `${url.origin}${url.pathname}`,
							data: body || null
						}
					}
				]
			}

			fetch(endpoint, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			}).catch(() => {})
		}
	} catch {}

	return new Response(null, {
		status: 204,
		headers: {
			'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
			'pragma': 'no-cache',
			'expires': '0',
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'POST,GET,OPTIONS',
			'access-control-allow-headers': 'content-type',
			'x-no-cache': '1'
		}
	})
}

export const GET: RequestHandler = async (ctx) => {
	// Allow GET pings too
	return POST(ctx)
}

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
			'pragma': 'no-cache',
			'expires': '0',
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'POST,GET,OPTIONS',
			'access-control-allow-headers': 'content-type',
			'x-no-cache': '1'
		}
	})
}



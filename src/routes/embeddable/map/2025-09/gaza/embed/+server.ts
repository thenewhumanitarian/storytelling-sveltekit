import type { RequestHandler } from './$types'
import scriptSource from '$lib/components/gaza-map/embed-script.js?raw'
import { env as privateEnv } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

// Configure to run on every request (no caching at function level)
export const config = {
	runtime: 'nodejs',
	dynamic: 'force-dynamic'
}

// Function for tracking embed requests
async function trackEmbedRequest(request: Request, url: URL) {
	const measurementId = publicEnv.PUBLIC_GA4_ID || privateEnv.PUBLIC_GA4_ID
	const apiSecret = privateEnv.GA4_API_SECRET
	
	if (!measurementId || !apiSecret) {
		console.log('[embed] GA4 tracking disabled - missing env vars', {
			hasMeasurementId: Boolean(measurementId),
			hasApiSecret: Boolean(apiSecret)
		})
		return
	}

	try {
		const base = privateEnv.GA_ENDPOINT || privateEnv.GA4_ENDPOINT || 'https://www.google-analytics.com'
		const endpoint = `${base}/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
		
		const ref = request.headers.get('referer') || ''
		const ua = request.headers.get('user-agent') || ''
		const cfCountry = request.headers.get('cf-ipcountry') || ''
		const cfRay = request.headers.get('cf-ray') || ''
		
		// Generate client ID
		const clientId = crypto.randomUUID()
		
		const payload = {
			client_id: clientId,
			events: [
				{
					name: 'embed_script_requested',
					params: {
						path: url.pathname,
						referrer: ref,
						user_agent: ua,
						page_location: `${url.origin}${url.pathname}`,
						cf_country: cfCountry,
						cf_ray: cfRay,
						function_type: 'nodejs'
					}
				}
			]
		}

		console.log('[embed] tracking request', {
			path: url.pathname,
			referrer: ref,
			country: cfCountry,
			measurementId,
			clientId
		})

		// Fire-and-forget tracking (don't await to avoid blocking response)
		fetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		}).catch((e) => {
			console.error('[embed] GA4 tracking error:', e)
		})
		
	} catch (e) {
		console.error('[embed] tracking setup error:', e)
	}
}

export const GET: RequestHandler = async ({ request, url }) => {
	const body = scriptSource || '// embed script not found'

	// Track every request (force-dynamic ensures function runs on every request)
	await trackEmbedRequest(request, url)

	// Determine cache strategy
	const isDev = process.env.NODE_ENV === 'development'
	
	return new Response(body, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': isDev
				? 'no-cache, no-store, must-revalidate'
				: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60',
			// Add function-specific headers
			'x-function-type': 'nodejs',
			'x-tracked': 'true'
		}
	})
}

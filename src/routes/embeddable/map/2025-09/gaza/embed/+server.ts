import type { RequestHandler } from './$types'
import scriptSource from '$lib/components/gaza-map/embed-script.js?raw'

// Keep Node.js runtime consistent with project settings
export const config = { runtime: 'nodejs22.x' }

export const GET: RequestHandler = async () => {
	const body = scriptSource || '// embed script not found'

	return new Response(body, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
            // Long cache since script is versionless path; SWR keeps it fresh periodically
            'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60'
		}
	})
}

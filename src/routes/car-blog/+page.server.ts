import { client } from '$lib/contentfulClient'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	// Get all blogs from Contentful
	const blogs = await client.getEntries({
		content_type: 'liveBlog'
	})

	if (blogs && blogs.items.length > 0) {
		return {
			status: 200,
			blogs: blogs.items
		}
	}

	return {
		status: 404
	}
}
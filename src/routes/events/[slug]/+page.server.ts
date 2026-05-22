import { getEvent } from '$lib/events/registry';
import { getEventbriteCheckout } from '$lib/events/eventbrite';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const event = getEvent(params.slug);
	const eventbriteToken = env.EVENTBRITE_API_TOKEN ?? env.EVENTBRITE_API_KEY;
	const checkout = await getEventbriteCheckout(event.meta, eventbriteToken);

	return { event, checkout };
};

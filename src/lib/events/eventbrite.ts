import type { EventMeta } from './types';

export interface EventCheckoutConfig {
	enabled: boolean;
	eventId: string | null;
}

const EVENTBRITE_ID_PATTERN = /eventbrite\.com\/e\/[^/?#]*-(\d+)/i;

export function extractEventbriteEventId(meta: EventMeta): string | null {
	if (meta.eventbriteEventId) return meta.eventbriteEventId;

	const fromUrl = meta.registrationUrl.match(EVENTBRITE_ID_PATTERN);
	return fromUrl?.[1] ?? null;
}

interface EventbriteApiEvent {
	id: string;
	status?: string;
}

export async function getEventbriteCheckout(
	meta: EventMeta,
	apiKey?: string
): Promise<EventCheckoutConfig> {
	const eventId = extractEventbriteEventId(meta);
	if (!eventId) {
		return { enabled: false, eventId: null };
	}

	if (!apiKey) {
		return { enabled: true, eventId };
	}

	try {
		const response = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			console.warn(`Eventbrite API returned ${response.status} for event ${eventId}`);
			return { enabled: true, eventId };
		}

		const data = (await response.json()) as EventbriteApiEvent;
		const isAvailable = data.status !== 'canceled' && data.status !== 'draft';

		return {
			enabled: isAvailable,
			eventId: String(data.id ?? eventId)
		};
	} catch (error) {
		console.warn('Eventbrite API request failed:', error);
		return { enabled: true, eventId };
	}
}

// "Get involved" tips form, shared by /climate/landing and the embeddable form at
// /climate/embed/forms/get-involved. Tips reuse the conversation wall's private-message path:
// stored for TNH editors in /climate/admin, never published, never sent to AI.
import { fail, type RequestEvent } from '@sveltejs/kit';
import { climateDataService } from '$lib/server/climate';
import { checkStamp, looksAutomated } from '$lib/server/climate-guard';

const unavailable = 'This form is temporarily unavailable. Please try again later.';
// Leaves room for the "From:" line under the 1000-character limit on private messages.
const maxMessage = 780;

export async function tipAction({
	request,
	fetch,
	getClientAddress
}: Pick<RequestEvent, 'request' | 'fetch' | 'getClientAddress'>) {
	const form = await request.formData();
	const text = (name: string) => {
		const value = form.get(name);
		return typeof value === 'string' ? value.trim() : '';
	};
	const message = text('message');
	const name = text('name');
	const email = text('email').toLowerCase();
	const values = { message, name, email };
	const service = climateDataService(fetch);
	if (!service) return fail(503, { ok: false, values, message: unavailable });

	if (!message || Array.from(message).length > maxMessage || message.includes('\0')) {
		return fail(400, {
			ok: false,
			values,
			message: `Write your tip or idea in 1 to ${maxMessage} characters.`
		});
	}
	if (name.length > 80 || name.includes('\0')) {
		return fail(400, { ok: false, values, message: 'Keep your name under 80 characters.' });
	}
	if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
		return fail(400, { ok: false, values, message: 'Check the email address, or leave it out.' });
	}

	// Bot traps, as on the wall. Each answers like a success so automated senders learn nothing.
	const stamp = checkStamp(form.get('started'));
	if (
		form.get('website') ||
		stamp === 'missing' ||
		stamp === 'too-fast' ||
		looksAutomated(request.headers.get('user-agent'))
	) {
		return { ok: true, values: null, message: 'Thank you.' };
	}
	if (stamp === 'expired') {
		return fail(400, {
			ok: false,
			values,
			message: 'This page has been open a long time. Reload it and try again.'
		});
	}

	const from = [name, email && `<${email}>`].filter(Boolean).join(' ');
	const body = from ? `${message}\n\nFrom: ${from}` : message;

	try {
		const { accepted } = await service.contribute(getClientAddress(), body, 'private', null, null);
		if (!accepted) {
			return fail(429, {
				ok: false,
				values,
				message: 'Too many messages from here. Please wait a few minutes and try again.'
			});
		}
		return {
			ok: true,
			values: null,
			message: 'Thank you. Your message went privately to the TNH team.'
		};
	} catch {
		return fail(503, { ok: false, values, message: unavailable });
	}
}

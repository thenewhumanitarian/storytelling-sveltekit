import { fail } from '@sveltejs/kit';
import {
	climateDataService,
	climateReactor,
	commentsOpen,
	climateRealtimeConfig,
	matchesBlockedClimatePhrase,
	setClimateReactor
} from '$lib/server/climate';
import { analyse, autoPublishEnabled, normalisedTerm } from '$lib/server/climate-ai';
import { checkStamp, formStamp, looksAutomated, takeAiBudget } from '$lib/server/climate-guard';
import type { Actions, PageServerLoad } from './$types';

const topics = new Set(['water', 'land', 'rebuilding', 'adaptation']);
const entryId = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const unavailable = 'This form is temporarily unavailable. Please try again later.';
const blockedMessage =
	'This can’t go on the public wall. You can send it privately to the TNH team instead.';
const blockedCommentMessage = 'This comment can’t be posted. Please keep it respectful.';
const rateLimited = 'Too many attempts. Please wait a few minutes and try again.';

export const load: PageServerLoad = async ({ cookies, fetch, setHeaders }) => {
	const realtime = climateRealtimeConfig();
	const offline = {
		configured: false,
		wall: [],
		reactionsEnabled: false,
		realtime,
		formStamp: formStamp(),
		commentsEnabled: false
	};
	const service = climateDataService(fetch);
	if (!service) return offline;
	setHeaders({ 'cache-control': 'private, no-store' });

	try {
		const reactor = climateReactor(cookies);
		const [wallData, commentsEnabled] = await Promise.all([
			service.wall(reactor),
			commentsOpen(service)
		]);
		if (!reactor && wallData.reactionsEnabled) setClimateReactor(cookies);
		return { configured: true, realtime, formStamp: formStamp(), commentsEnabled, ...wallData };
	} catch {
		return offline;
	}
};

export const actions = {
	contribute: async ({ cookies, request, fetch, getClientAddress }) => {
		const service = climateDataService(fetch);
		const kind = 'contribute' as const;
		if (!service) return fail(503, { kind, ok: false, message: unavailable });

		const form = await request.formData();
		const body = form.get('message');
		const visibility = form.get('visibility');
		const selectedTopic = form.get('topic');
		const topic = selectedTopic === null || selectedTopic === '' ? null : selectedTopic;

		if (visibility !== 'private' && visibility !== 'public') {
			return fail(400, { kind, ok: false, message: 'Choose how to share your message.' });
		}

		const maxLength = visibility === 'public' ? 500 : 1000;
		const message = typeof body === 'string' ? body.trim() : '';
		if (
			!message ||
			message.length > maxLength * 2 ||
			message.includes('\0') ||
			Array.from(message).length > maxLength
		) {
			return fail(400, {
				kind,
				ok: false,
				message: `Enter a message of 1 to ${maxLength} characters.`
			});
		}
		if (topic !== null && (typeof topic !== 'string' || !topics.has(topic))) {
			return fail(400, { kind, ok: false, message: 'Choose one of the listed topics.' });
		}

		// Bot traps. Each answers like a success so automated senders learn nothing:
		// a hidden field people never see, a signed page-render stamp (missing, or sent faster than
		// anyone could type), and obvious automation user agents.
		const stamp = checkStamp(form.get('started'));
		if (
			form.get('website') ||
			stamp === 'missing' ||
			stamp === 'too-fast' ||
			looksAutomated(request.headers.get('user-agent'))
		) {
			return { kind, ok: true, published: false, message: 'Thank you.' };
		}
		if (stamp === 'expired') {
			return fail(400, {
				kind,
				ok: false,
				message: 'This page has been open a long time. Reload it and try again.'
			});
		}

		try {
			if (visibility === 'public' && matchesBlockedClimatePhrase(message)) {
				return fail(422, { kind, ok: false, message: blockedMessage });
			}
			let screened = null;
			if (visibility === 'public') {
				const reactor = climateReactor(cookies);
				const { wall } = await service.wall(reactor);

				// Already on the wall? Count it as a +1 instead of a duplicate post.
				const key = normalisedTerm(message);
				const same = key ? wall.find((entry) => normalisedTerm(entry.body) === key) : undefined;
				if (same) {
					if (reactor && !same.reacted) {
						await service.react(getClientAddress(), same.id, reactor, 1);
					}
					return {
						kind,
						ok: true,
						published: true,
						duplicate: same.id,
						message: `“${same.body}” is already on the wall, so we added your +1.`
					};
				}

				// Only public posts are screened by AI. Private messages never leave TNH's systems.
				if (!takeAiBudget(getClientAddress())) {
					return fail(429, { kind, ok: false, message: rateLimited });
				}
				screened = {
					...(await analyse(message, wall)),
					publish: await autoPublishEnabled(service)
				};
			}
			const { accepted, token } = await service.contribute(
				getClientAddress(),
				message,
				visibility,
				topic,
				screened
			);
			if (!accepted) return fail(429, { kind, ok: false, message: rateLimited });
			// Malicious posts are stored hidden so an editor can unblock a false positive in
			// /climate/admin, but the poster is told it won't appear.
			if (screened?.verdict === 'block') {
				return fail(422, { kind, ok: false, message: blockedMessage });
			}

			const published = screened?.publish === true && screened.verdict === 'allow';
			return {
				kind,
				ok: true,
				published,
				// Lets the browser recognise its own post on the wall once it's published, and later
				// withdraw it. Only this browser ever sees the token.
				term: screened ? (screened.term ?? message) : null,
				token: visibility === 'public' ? token : null,
				message:
					visibility === 'private'
						? 'Sent privately to the TNH team. Thank you.'
						: published
							? screened?.term
								? `Checked by AI. On the wall as “${screened.term}”.`
								: 'Checked by AI. Your thought is on the wall.'
							: screened?.term
								? `Checked by AI. After a quick TNH review it will appear as “${screened.term}”.`
								: 'Thanks. It will float up after a quick TNH review.'
			};
		} catch {
			return fail(503, { kind, ok: false, message: unavailable });
		}
	},
	react: async ({ cookies, fetch, getClientAddress, request }) => {
		const kind = 'react' as const;
		const service = climateDataService(fetch);
		if (!service) return fail(503, { kind, ok: false, message: unavailable });

		const form = await request.formData();
		const entry = form.get('entry');
		const weightField = form.get('weight');
		const weight =
			weightField === '-1' || weightField === '0' || weightField === '1' || weightField === '2'
				? (Number(weightField) as -1 | 0 | 1 | 2)
				: null;
		const reactor = climateReactor(cookies);
		if (typeof entry !== 'string' || !entryId.test(entry)) {
			return fail(400, { kind, ok: false, message: 'Choose a contribution to react to.' });
		}
		if (weight === null) {
			return fail(400, { kind, ok: false, message: 'Choose whether to add or remove your +1.' });
		}
		if (!reactor) {
			return fail(400, { kind, ok: false, message: 'Allow cookies to change your +1.' });
		}

		try {
			const result = await service.react(getClientAddress(), entry, reactor, weight);
			if (result.outcome === 'rate_limited')
				return fail(429, { kind, ok: false, message: rateLimited });
			if (result.outcome === 'unavailable') {
				return fail(404, {
					kind,
					ok: false,
					message: 'This contribution is no longer on the wall.'
				});
			}
			return {
				kind,
				ok: true,
				entry,
				reactions: result.reactions,
				reacted: result.reacted,
				boosted: result.boosted,
				downvoted: result.downvoted
			};
		} catch {
			return fail(503, {
				kind,
				ok: false,
				message: 'Your +1 could not be updated. Please try again.'
			});
		}
	},
	comment: async ({ request, fetch, getClientAddress }) => {
		const kind = 'comment' as const;
		const service = climateDataService(fetch);
		if (!service) return fail(503, { kind, ok: false, message: unavailable });

		const form = await request.formData();
		const entry = form.get('entry');
		const body = form.get('message');
		const message = typeof body === 'string' ? body.trim() : '';
		if (typeof entry !== 'string' || !entryId.test(entry)) {
			return fail(400, { kind, ok: false, message: 'Choose a thought to comment on.' });
		}
		if (!message || message.includes('\0') || Array.from(message).length > 300) {
			return fail(400, { kind, ok: false, message: 'Write a comment of 1 to 300 characters.' });
		}

		// Same bot traps as posts; trapped comments get the normal thank-you.
		const stamp = checkStamp(form.get('started'));
		if (
			form.get('website') ||
			stamp === 'missing' ||
			stamp === 'too-fast' ||
			looksAutomated(request.headers.get('user-agent'))
		) {
			return { kind, ok: true, published: false, message: 'Thank you.' };
		}
		if (stamp === 'expired') {
			return fail(400, {
				kind,
				ok: false,
				message: 'This page has been open a long time. Reload it and try again.'
			});
		}

		try {
			if (matchesBlockedClimatePhrase(message)) {
				return fail(422, { kind, ok: false, message: blockedCommentMessage });
			}
			if (!takeAiBudget(getClientAddress())) {
				return fail(429, { kind, ok: false, message: rateLimited });
			}
			const screened = {
				...(await analyse(message, [])),
				publish: await autoPublishEnabled(service)
			};
			const outcome = await service.addComment(getClientAddress(), entry, message, screened);
			if (outcome === 'rate_limited') return fail(429, { kind, ok: false, message: rateLimited });
			if (outcome === 'disabled') {
				return fail(403, { kind, ok: false, message: 'Comments are closed right now.' });
			}
			if (outcome === 'unavailable') {
				return fail(404, { kind, ok: false, message: 'This thought is no longer on the wall.' });
			}
			if (screened.verdict === 'block') {
				return fail(422, { kind, ok: false, message: blockedCommentMessage });
			}
			const published = screened.publish && screened.verdict === 'allow';
			if (published) await service.broadcastWallChanged();
			return {
				kind,
				ok: true,
				published,
				message: published ? 'Comment added.' : 'Thanks. It will appear after a quick TNH review.'
			};
		} catch {
			return fail(503, { kind, ok: false, message: unavailable });
		}
	},

	withdraw: async ({ request, fetch }) => {
		const kind = 'withdraw' as const;
		const service = climateDataService(fetch);
		if (!service) return fail(503, { kind, ok: false, message: unavailable });
		const token = (await request.formData()).get('token');
		if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) {
			return fail(400, { kind, ok: false, message: 'This thought can’t be removed from here.' });
		}
		try {
			const removed = await service.withdraw(token);
			return removed
				? { kind, ok: true, message: 'Removed from the wall. TNH keeps it privately.' }
				: fail(404, { kind, ok: false, message: 'This thought is already off the wall.' });
		} catch {
			return fail(503, { kind, ok: false, message: unavailable });
		}
	},
	subscribe: async ({ request, fetch, getClientAddress }) => {
		const service = climateDataService(fetch);
		const kind = 'subscribe' as const;
		if (!service) return fail(503, { kind, ok: false, message: unavailable });

		const form = await request.formData();
		const emailField = form.get('email');
		const email = typeof emailField === 'string' ? emailField.trim().toLowerCase() : '';
		if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { kind, ok: false, message: 'Enter a valid email address.' });
		}

		try {
			const accepted = await service.subscribe(getClientAddress(), email);
			if (!accepted) return fail(429, { kind, ok: false, message: rateLimited });

			return { kind, ok: true, message: 'Thank you. Your signup for project updates is recorded.' };
		} catch {
			return fail(503, { kind, ok: false, message: unavailable });
		}
	}
} satisfies Actions;

import { createHmac, randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { Cookies } from '@sveltejs/kit';
import type { Moderation } from './climate-ai';

export interface WallEntry {
	id: string;
	topic: string | null;
	body: string;
	reactions: number;
	reacted: boolean;
	/** This visitor double-clicked +: their reaction counts as +2. */
	boosted: boolean;
	/** This visitor voted it down (−1). */
	downvoted: boolean;
	/** Published comments in its thread. */
	comments: number;
}

export interface ThreadComment {
	id: string;
	created_at: string;
	body: string;
}

export interface AdminComment extends ThreadComment {
	contribution_id: string;
	status: 'pending' | 'published' | 'removed';
	moderation_verdict: 'allow' | 'review' | 'block' | null;
	moderation_categories: string[] | null;
	moderation_reason: string | null;
}

type ClimateAction = 'contribute' | 'react' | 'subscribe' | 'comment';
type ClimateProcedure =
	| 'climate_contribute'
	| 'climate_contribute_moderated'
	| 'climate_react'
	| 'climate_react_weighted'
	| 'climate_subscribe'
	| 'climate_wall'
	| 'climate_wall_with_reactions'
	| 'climate_withdraw'
	| 'climate_admin_entries'
	| 'climate_admin_update'
	| 'climate_admin_delete'
	| 'climate_settings'
	| 'climate_admin_set_auto_publish'
	| 'climate_admin_set_comments'
	| 'climate_comments'
	| 'climate_comment_counts'
	| 'climate_add_comment'
	| 'climate_admin_comments'
	| 'climate_admin_update_comment'
	| 'climate_admin_delete_comment';

export type AdminStatus = 'pending' | 'published' | 'removed';
export interface AdminEntry {
	id: string;
	created_at: string;
	visibility: 'public' | 'private';
	status: AdminStatus;
	topic: string | null;
	body: string;
	published_body: string | null;
	moderation_verdict: 'allow' | 'review' | 'block' | null;
	moderation_categories: string[] | null;
	moderation_reason: string | null;
	moderation_model: string | null;
	moderation_term: string | null;
	withdrawn_at: string | null;
	reactions: number;
	boosts: number;
}

export type ReactionWeight = -1 | 0 | 1 | 2;
type ReactionResult = {
	boosted?: boolean;
	downvoted?: boolean;
	outcome: 'accepted' | 'unavailable' | 'rate_limited';
	reactions: number;
	reacted: boolean;
};

const reactorCookie = 'tnh_climate_reactor';

export function climateReactor(cookies: Cookies) {
	const token = cookies.get(reactorCookie);
	return token && /^[A-Za-z0-9_-]{32}$/.test(token) ? token : null;
}

export function setClimateReactor(cookies: Cookies) {
	cookies.set(reactorCookie, randomBytes(24).toString('base64url'), {
		path: '/climate',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});
}

export type ClimateSettings = { auto_publish?: boolean; comments_enabled?: boolean };
let settingsCache: { at: number; value: ClimateSettings } | null = null;

/** Comments are on unless an editor switched them off (or the comments migration isn't applied). */
export async function commentsOpen(service: { settings: () => Promise<ClimateSettings | null> }) {
	try {
		return (await service.settings())?.comments_enabled !== false;
	} catch {
		return true;
	}
}

export function climateRealtimeConfig() {
	const key = publicEnv.PUBLIC_CLIMATE_SUPABASE_PUBLISHABLE_KEY;
	const url = env.CLIMATE_SUPABASE_URL && URL.parse(env.CLIMATE_SUPABASE_URL);
	if (!key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) || !url || url.protocol !== 'https:') {
		return null;
	}
	return { url: url.origin, key };
}

function climateWords(text: string) {
	return text
		.normalize('NFKC')
		.toLowerCase()
		.replace(/\p{Cf}/gu, '')
		.replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
		.trim();
}

export function matchesBlockedClimatePhrase(message: string) {
	const configured = env.CLIMATE_BLOCKED_PHRASES;
	if (!configured) return false;

	const phrases: unknown = JSON.parse(configured);
	if (!Array.isArray(phrases) || !phrases.every((phrase) => typeof phrase === 'string')) {
		throw new Error('CLIMATE_BLOCKED_PHRASES must be a JSON array of strings.');
	}

	const words = ` ${climateWords(message)} `;
	return phrases.some((phrase) => {
		const blocked = climateWords(phrase);
		return blocked && words.includes(` ${blocked} `);
	});
}

class ClimateRequestError extends Error {
	constructor(readonly code: string | undefined) {
		super('Climate data service request failed.');
	}
}

export function climateDataService(fetch: typeof globalThis.fetch) {
	const url = env.CLIMATE_SUPABASE_URL;
	const secret = env.CLIMATE_SUPABASE_SECRET_KEY;
	if (!url || !secret?.startsWith('sb_secret_')) return null;
	const credentials = { url, secret };

	async function call<T>(
		procedure: ClimateProcedure,
		args: Record<string, string | string[] | boolean | null>
	) {
		const response = await fetch(new URL(`/rest/v1/rpc/${procedure}`, credentials.url), {
			method: 'POST',
			headers: { apikey: credentials.secret, 'content-type': 'application/json' },
			credentials: 'omit',
			body: JSON.stringify(args),
			signal: AbortSignal.timeout(5000)
		});

		if (!response.ok) {
			const error: { code?: string } | null = await response.json().catch(() => null);
			throw new ClimateRequestError(error?.code);
		}
		return (await response.json()) as T;
	}

	function fingerprint(parts: string[]) {
		return createHmac('sha256', credentials.secret).update(JSON.stringify(parts)).digest('hex');
	}

	function clientKey(action: ClimateAction, address: string) {
		const window = Math.floor(Date.now() / (10 * 60 * 1000));
		return fingerprint(['climate-rate', action, String(window), address]);
	}

	/** Published comment counts per thought; empty before the comments migration. */
	async function commentCounts() {
		try {
			const rows = await call<{ contribution_id: string; comments: number }[]>(
				'climate_comment_counts',
				{}
			);
			return new Map(rows.map((row) => [row.contribution_id, row.comments]));
		} catch {
			return new Map<string, number>();
		}
	}

	return {
		async wall(reactorToken: string | null) {
			try {
				const [rows, counts] = await Promise.all([
					call<WallEntry[]>('climate_wall_with_reactions', {
						p_reactor_key: reactorToken ? fingerprint(['climate-reactor', reactorToken]) : null
					}),
					commentCounts()
				]);
				const wall = rows.map(({ id, topic, body, reactions, reacted, boosted, downvoted }) => ({
					id,
					topic,
					body,
					reactions,
					reacted,
					boosted: boosted === true,
					downvoted: downvoted === true,
					comments: counts.get(id) ?? 0
				}));
				return { wall, reactionsEnabled: true };
			} catch (error) {
				// Keep the read-only wall available while the reactions migration rolls out.
				if (!(error instanceof ClimateRequestError) || error.code !== 'PGRST202') throw error;
				const rows = await call<Pick<WallEntry, 'id' | 'topic' | 'body'>[]>('climate_wall', {});
				return {
					wall: rows.map(({ id, topic, body }) => ({
						id,
						topic,
						body,
						reactions: 0,
						reacted: false,
						boosted: false,
						downvoted: false,
						comments: 0
					})),
					reactionsEnabled: false
				};
			}
		},
		/** weight: 0 removes your reaction, 1 is a +1, 2 is the double-click boost. */
		async react(address: string, entry: string, reactorToken: string, weight: ReactionWeight) {
			const base = {
				p_contribution_id: entry,
				p_reactor_key: fingerprint(['climate-reactor', reactorToken]),
				p_client_key: clientKey('react', address)
			};
			let result: ReactionResult | undefined;
			try {
				[result] = await call<ReactionResult[]>('climate_react_weighted', {
					...base,
					p_weight: String(weight)
				});
			} catch (error) {
				// Before the boost migration, a boost is stored as a plain +1.
				if (!(error instanceof ClimateRequestError) || error.code !== 'PGRST202') throw error;
				[result] = await call<ReactionResult[]>('climate_react', {
					...base,
					p_liked: weight > 0
				});
			}
			if (!result) throw new Error('Climate reaction result was missing.');
			return {
				...result,
				boosted: result.boosted === true,
				downvoted: result.downvoted === true
			};
		},
		async contribute(
			address: string,
			body: string,
			visibility: 'private' | 'public',
			topic: string | null,
			moderation: (Moderation & { publish: boolean }) | null = null
		): Promise<{ accepted: boolean; token: string }> {
			const key = clientKey('contribute', address);
			// The submission key doubles as the author's private token for withdrawing the post.
			const token = fingerprint(['climate-question', key, body, visibility, topic ?? '']);
			const base = {
				p_body: body,
				p_visibility: visibility,
				p_topic: topic,
				p_submission_key: token,
				p_client_key: key
			};
			if (moderation) {
				try {
					const accepted = await call<boolean>('climate_contribute_moderated', {
						...base,
						p_verdict: moderation.verdict,
						p_categories: moderation.categories,
						p_reason: moderation.reason,
						p_model: moderation.model,
						p_term: moderation.term,
						p_publish: moderation.publish
					});
					return { accepted, token };
				} catch (error) {
					// Keep accepting posts while the moderation migration rolls out.
					if (!(error instanceof ClimateRequestError) || error.code !== 'PGRST202') throw error;
					if (moderation.verdict === 'block') return { accepted: true, token };
				}
			}
			return { accepted: await call<boolean>('climate_contribute', base), token };
		},
		/** Take the author's own public post off the wall; TNH keeps it privately. */
		withdraw(token: string) {
			return call<boolean>('climate_withdraw', { p_submission_key: token });
		},
		/** Admin only: callers must check the admin session first. */
		admin: {
			entries() {
				return call<AdminEntry[]>('climate_admin_entries', {});
			},
			update(id: string, status: AdminStatus, publishedBody: string | null) {
				return call<string>('climate_admin_update', {
					p_id: id,
					p_status: status,
					p_published_body: publishedBody
				});
			},
			remove(id: string) {
				return call<boolean>('climate_admin_delete', { p_id: id });
			},
			async comments() {
				try {
					return await call<AdminComment[]>('climate_admin_comments', {});
				} catch {
					return [];
				}
			},
			updateComment(id: string, status: AdminComment['status']) {
				return call<boolean>('climate_admin_update_comment', { p_id: id, p_status: status });
			},
			removeComment(id: string) {
				return call<boolean>('climate_admin_delete_comment', { p_id: id });
			},
			setComments(enabled: boolean) {
				settingsCache = null;
				return call<boolean>('climate_admin_set_comments', { p_enabled: enabled });
			},
			setAutoPublish(enabled: boolean) {
				settingsCache = null;
				return call<boolean>('climate_admin_set_auto_publish', { p_enabled: enabled });
			}
		},
		/** Published comments in a thought's thread, oldest first. */
		comments(entry: string) {
			return call<ThreadComment[]>('climate_comments', { p_contribution_id: entry });
		},
		/** Returns 'ok', 'rate_limited' or 'unavailable'. */
		addComment(
			address: string,
			entry: string,
			body: string,
			moderation: Moderation & { publish: boolean }
		) {
			const key = clientKey('comment', address);
			return call<string>('climate_add_comment', {
				p_contribution_id: entry,
				p_body: body,
				p_submission_key: fingerprint(['climate-comment', key, entry, body]),
				p_client_key: key,
				p_verdict: moderation.verdict,
				p_categories: moderation.categories,
				p_reason: moderation.reason,
				p_model: moderation.model,
				p_publish: moderation.publish
			});
		},
		/** Runtime settings from the database, cached briefly. Null before the settings migration. */
		async settings(): Promise<ClimateSettings | null> {
			if (settingsCache && Date.now() - settingsCache.at < 5000) return settingsCache.value;
			try {
				const value = await call<ClimateSettings>('climate_settings', {});
				settingsCache = { at: Date.now(), value };
				return value;
			} catch (error) {
				if (error instanceof ClimateRequestError && error.code === 'PGRST202') return null;
				throw error;
			}
		},
		/**
		 * Tell every open wall to refresh now (after an editor publishes, blocks or deletes), via
		 * Supabase Realtime's broadcast API on the same channel the browsers listen to. Best effort:
		 * walls also refresh on their own every few seconds.
		 */
		async broadcastWallChanged() {
			try {
				await fetch(new URL('/realtime/v1/api/broadcast', credentials.url), {
					method: 'POST',
					headers: { apikey: credentials.secret, 'content-type': 'application/json' },
					body: JSON.stringify({
						messages: [{ topic: 'tnh-climate-cloud-v1', event: 'wall-changed', payload: {} }]
					}),
					signal: AbortSignal.timeout(3000)
				});
			} catch {
				// The periodic refresh covers it.
			}
		},
		subscribe(address: string, email: string) {
			return call<boolean>('climate_subscribe', {
				p_email: email,
				p_client_key: clientKey('subscribe', address)
			});
		}
	};
}

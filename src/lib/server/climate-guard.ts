import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/**
 * Cheap bot defences for the shout bar, layered before any AI call or database write:
 *
 * - A signed form stamp issued when the page renders. Submissions without one, faster than a
 *   person could type, or a day old are dropped. Bots that post straight to the endpoint never
 *   have a valid stamp.
 * - Obvious automation user agents are dropped.
 * - A per-IP budget for AI screening, so a spammer can't burn the model quota. (The database
 *   separately limits stored submissions per IP.)
 *
 * Dropped submissions get the same "thank you" a person would, so bots learn nothing.
 */

const minAgeMs = 2500;
const maxAgeMs = 24 * 60 * 60 * 1000;
const aiWindowMs = 10 * 60 * 1000;
const aiPerWindow = 12;
const fallbackSecret = randomBytes(32);
const aiCalls = new Map<string, number[]>();

function secret() {
	return env.CLIMATE_SUPABASE_SECRET_KEY || fallbackSecret;
}

function signature(issued: number) {
	return createHmac('sha256', secret()).update(`climate-form:${issued}`).digest('base64url');
}

export function formStamp() {
	const issued = Date.now();
	return `${issued}.${signature(issued)}`;
}

export type StampCheck = 'ok' | 'missing' | 'too-fast' | 'expired';

export function checkStamp(value: FormDataEntryValue | null): StampCheck {
	if (typeof value !== 'string') return 'missing';
	const [issuedText, given] = value.split('.');
	const issued = Number(issuedText);
	if (!Number.isSafeInteger(issued) || !given) return 'missing';
	const expected = Buffer.from(signature(issued));
	const actual = Buffer.from(given);
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return 'missing';
	const age = Date.now() - issued;
	if (age < minAgeMs) return 'too-fast';
	if (age > maxAgeMs) return 'expired';
	return 'ok';
}

const automation =
	/bot|crawl|spider|slurp|curl|wget|python-requests|aiohttp|httpx|go-http-client|okhttp|libwww|scrapy|headless|phantomjs|selenium|puppeteer|playwright/i;

export function looksAutomated(userAgent: string | null) {
	return !userAgent || userAgent.length < 20 || automation.test(userAgent);
}

/** True while this address still has AI screenings left in the current window. */
export function takeAiBudget(address: string) {
	const now = Date.now();
	const recent = (aiCalls.get(address) ?? []).filter((time) => now - time < aiWindowMs);
	if (recent.length >= aiPerWindow) {
		aiCalls.set(address, recent);
		return false;
	}
	recent.push(now);
	aiCalls.set(address, recent);
	if (aiCalls.size > 5000) aiCalls.clear();
	return true;
}

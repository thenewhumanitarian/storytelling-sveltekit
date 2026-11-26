import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';

/**
 * Username + password access to /climate/admin, from CLIMATE_ADMIN_USER and CLIMATE_ADMIN_PASS.
 * The session cookie is an expiry plus an HMAC over it, keyed by those credentials and the
 * server-only Supabase key, so changing any of them logs every editor out.
 */

const cookieName = 'tnh_climate_admin';
const sessionHours = 12;
const attemptWindowMs = 15 * 60 * 1000;
const maxAttempts = 8;
const attempts = new Map<string, number[]>();

export function adminConfigured() {
	return Boolean(env.CLIMATE_ADMIN_USER) && (env.CLIMATE_ADMIN_PASS ?? '').length >= 12;
}

function signingKey() {
	return createHash('sha256')
		.update(
			`climate-admin:${env.CLIMATE_ADMIN_USER}:${env.CLIMATE_ADMIN_PASS}:${env.CLIMATE_SUPABASE_SECRET_KEY ?? ''}`
		)
		.digest();
}

function sign(expires: number) {
	return createHmac('sha256', signingKey()).update(String(expires)).digest('base64url');
}

function same(a: string | Buffer, b: string | Buffer) {
	const left = typeof a === 'string' ? Buffer.from(a) : a;
	const right = typeof b === 'string' ? Buffer.from(b) : b;
	return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdmin(cookies: Cookies) {
	if (!adminConfigured()) return false;
	const [expires, signature] = (cookies.get(cookieName) ?? '').split('.');
	const until = Number(expires);
	return Boolean(signature) && until > Date.now() && same(signature, sign(until));
}

export function throttled(address: string) {
	const now = Date.now();
	const recent = (attempts.get(address) ?? []).filter((time) => now - time < attemptWindowMs);
	attempts.set(address, recent);
	if (attempts.size > 5000) attempts.clear();
	return recent.length >= maxAttempts;
}

export function recordFailedLogin(address: string) {
	attempts.set(address, [...(attempts.get(address) ?? []), Date.now()]);
}

/** Constant-time credential check; compares digests so length differences don't leak. */
export function credentialsMatch(user: string, password: string) {
	if (!adminConfigured()) return false;
	const digest = (value: string) => createHash('sha256').update(value).digest();
	// Evaluate both so timing doesn't reveal which one was wrong. Usernames ignore case.
	const userOk = same(
		digest(user.trim().toLowerCase()),
		digest((env.CLIMATE_ADMIN_USER ?? '').trim().toLowerCase())
	);
	const passOk = same(digest(password), digest(env.CLIMATE_ADMIN_PASS ?? ''));
	return userOk && passOk;
}

export function startSession(cookies: Cookies) {
	const expires = Date.now() + sessionHours * 60 * 60 * 1000;
	cookies.set(cookieName, `${expires}.${sign(expires)}`, {
		path: '/climate/admin',
		httpOnly: true,
		secure: !dev,
		sameSite: 'strict',
		maxAge: sessionHours * 60 * 60
	});
}

export function endSession(cookies: Cookies) {
	cookies.delete(cookieName, { path: '/climate/admin' });
}

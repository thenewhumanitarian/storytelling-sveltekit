import { fail, redirect } from '@sveltejs/kit';
import { autoPublishEnabled } from '$lib/server/climate-ai';
import { climateDataService, type AdminStatus } from '$lib/server/climate';
import {
	adminConfigured,
	endSession,
	isAdmin,
	credentialsMatch,
	recordFailedLogin,
	startSession,
	throttled
} from '$lib/server/climate-admin';
import type { Actions, PageServerLoad } from './$types';

const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const statuses = new Set<AdminStatus>(['pending', 'published', 'removed']);
const outcomes: Record<string, string> = {
	not_found: 'That entry no longer exists.',
	private_cannot_publish: 'Private messages can’t go on the public wall.',
	too_long: 'Wall text must be 500 characters or fewer.',
	invalid_status: 'Choose queue, wall or hidden.'
};

export const load: PageServerLoad = async ({ cookies, fetch, setHeaders, depends }) => {
	depends('climate:admin');
	setHeaders({ 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' });
	if (!adminConfigured()) return { state: 'unconfigured' as const };
	if (!isAdmin(cookies)) return { state: 'login' as const };

	const service = climateDataService(fetch);
	if (!service) return { state: 'no-database' as const };
	try {
		const [entries, settings] = await Promise.all([service.admin.entries(), service.settings()]);
		return {
			state: 'ready' as const,
			entries,
			autoPublish: await autoPublishEnabled(service),
			// Null until the settings migration is applied; the switch is hidden until then.
			settingsReady: settings !== null
		};
	} catch {
		return { state: 'migration' as const };
	}
};

export const actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const address = getClientAddress();
		if (throttled(address)) {
			return fail(429, { message: 'Too many attempts. Wait 15 minutes and try again.' });
		}
		const form = await request.formData();
		const user = form.get('user');
		const password = form.get('password');
		if (
			typeof user !== 'string' ||
			typeof password !== 'string' ||
			!credentialsMatch(user, password)
		) {
			recordFailedLogin(address);
			return fail(401, { message: 'That username or password isn’t right.' });
		}
		startSession(cookies);
		redirect(303, '/climate/admin');
	},

	logout: async ({ cookies }) => {
		endSession(cookies);
		redirect(303, '/climate/admin');
	},

	update: async ({ request, cookies, fetch }) => {
		if (!isAdmin(cookies)) return fail(401, { message: 'Your session has ended. Log in again.' });
		const service = climateDataService(fetch);
		if (!service) return fail(503, { message: 'The database isn’t configured.' });

		const form = await request.formData();
		const id = form.get('id');
		const status = form.get('status');
		const text = form.get('published_body');
		if (typeof id !== 'string' || !uuid.test(id)) return fail(400, { message: 'Unknown entry.' });
		if (typeof status !== 'string' || !statuses.has(status as AdminStatus)) {
			return fail(400, { message: outcomes.invalid_status });
		}
		const wallText = typeof text === 'string' && text.trim() ? text.trim().slice(0, 500) : null;

		try {
			const outcome = await service.admin.update(id, status as AdminStatus, wallText);
			if (outcome !== 'ok') return fail(400, { message: outcomes[outcome] ?? 'Not saved.' });
			await service.broadcastWallChanged();
			return { ok: true, id };
		} catch {
			return fail(503, { message: 'Couldn’t save. Try again.' });
		}
	},

	autopublish: async ({ request, cookies, fetch }) => {
		if (!isAdmin(cookies)) return fail(401, { message: 'Your session has ended. Log in again.' });
		const service = climateDataService(fetch);
		if (!service) return fail(503, { message: 'The database isn’t configured.' });
		const enabled = (await request.formData()).get('enabled') === 'true';
		try {
			await service.admin.setAutoPublish(enabled);
			return { ok: true };
		} catch {
			return fail(503, { message: 'Couldn’t change auto-publish. Try again.' });
		}
	},

	delete: async ({ request, cookies, fetch }) => {
		if (!isAdmin(cookies)) return fail(401, { message: 'Your session has ended. Log in again.' });
		const service = climateDataService(fetch);
		if (!service) return fail(503, { message: 'The database isn’t configured.' });

		const id = (await request.formData()).get('id');
		if (typeof id !== 'string' || !uuid.test(id)) return fail(400, { message: 'Unknown entry.' });
		try {
			const removed = await service.admin.remove(id);
			if (!removed) return fail(404, { message: outcomes.not_found });
			await service.broadcastWallChanged();
			return { ok: true, deleted: id };
		} catch {
			return fail(503, { message: 'Couldn’t delete. Try again.' });
		}
	}
} satisfies Actions;

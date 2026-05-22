import { error } from '@sveltejs/kit';
import type { EventModule, EventSummary } from './types';
import { whoOwnsTheNarrative } from './who-owns-the-narrative';

const modules: Record<string, EventModule> = {
	'who-owns-the-narrative': whoOwnsTheNarrative
};

export function getEventSlugs(): string[] {
	return Object.keys(modules);
}

export function getEvent(slug: string): EventModule {
	const event = modules[slug];
	if (!event) {
		throw error(404, 'Event not found');
	}
	return event;
}

export function getEventSummaries(): EventSummary[] {
	return Object.values(modules).map(({ meta }) => ({
		slug: meta.slug,
		title: meta.title,
		subtitle: meta.subtitle,
		description: meta.description,
		path: meta.canonicalPath,
		startDate: meta.startDate,
		status: meta.status,
		ogImage: meta.ogImage
	}));
}

export function tryGetEvent(slug: string): EventModule | null {
	return modules[slug] ?? null;
}

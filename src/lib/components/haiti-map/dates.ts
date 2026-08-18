import type { HaitiLang } from './types';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseHaitiDate(value: string | Date): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}

	const trimmed = value.trim();
	const isoDate = ISO_DATE_PATTERN.exec(trimmed);
	if (isoDate) {
		const [, year, month, day] = isoDate;
		const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
		const isExactDate =
			parsed.getUTCFullYear() === Number(year) &&
			parsed.getUTCMonth() === Number(month) - 1 &&
			parsed.getUTCDate() === Number(day);
		return isExactDate ? parsed : null;
	}

	return null;
}

export function normaliseHaitiDate(value: string | Date): string | null {
	const parsed = parseHaitiDate(value);
	return parsed ? parsed.toISOString().slice(0, 10) : null;
}

export function formatHaitiDate(value: string | Date, lang: HaitiLang): string {
	const parsed = parseHaitiDate(value);
	if (!parsed) return lang === 'fr' ? 'Date indisponible' : 'Date unavailable';

	return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(parsed);
}

export function formatHaitiShortDate(value: string | Date, lang: HaitiLang): string {
	const parsed = parseHaitiDate(value);
	if (!parsed) return lang === 'fr' ? 'Date indisponible' : 'Date unavailable';

	return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(parsed);
}

import { PUBLIC_BASE_URL } from '$env/static/public';

const DEFAULT_BASE = 'https://interactive.thenewhumanitarian.org';

export function getBaseUrl(): string {
	return (PUBLIC_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${getBaseUrl()}${normalized}`;
}

export function absoluteAssetUrl(assetPath: string): string {
	if (assetPath.startsWith('http')) return assetPath;
	return absoluteUrl(assetPath);
}

export function eventCanonicalUrl(canonicalPath: string): string {
	return absoluteUrl(canonicalPath);
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
	const payload = Array.isArray(data) ? data : [data];
	return JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

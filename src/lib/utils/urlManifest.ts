import manifest from '../../../scripts/url-manifest.json';

export const PROD_BASE = 'https://interactive.thenewhumanitarian.org';

export type UrlEntry = {
	path: string;
	group: string;
	name: string;
	expectStatus?: number;
	expectRedirect?: boolean;
	expectContentType?: string;
};

type Manifest = {
	lebanonDiarySlugs: string[];
	syriaMarkerIds: string[];
	entries: UrlEntry[];
};

/** All public paths from scripts/url-manifest.json (same set as pnpm check:urls). */
export function expandUrlManifest(raw: Manifest = manifest as Manifest): UrlEntry[] {
	const entries: UrlEntry[] = [...raw.entries];

	const lebanonBase = '/stories/2025/05/22/lebanon-displacement-diaries';
	for (const slug of raw.lebanonDiarySlugs) {
		entries.push({
			path: `${lebanonBase}/diaries/${slug}`,
			group: 'lebanon',
			name: `Diary EN: ${slug}`
		});
		entries.push({
			path: `${lebanonBase}/ar/diaries/${slug}`,
			group: 'lebanon',
			name: `Diary AR: ${slug}`
		});
	}

	for (const id of raw.syriaMarkerIds) {
		entries.push({
			path: `/embeddable/map/2024-11/syria/${id}`,
			group: 'syria',
			name: `Syria marker ${id}`
		});
	}

	return entries;
}

export function groupUrlEntries(entries: UrlEntry[]): Map<string, UrlEntry[]> {
	const groups = new Map<string, UrlEntry[]>();
	for (const entry of entries) {
		const list = groups.get(entry.group) ?? [];
		list.push(entry);
		groups.set(entry.group, list);
	}
	return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

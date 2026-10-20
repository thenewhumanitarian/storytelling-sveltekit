#!/usr/bin/env node
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import {
	HAITI_FEED_URL,
	parsePublicCsv,
	publicCsv
} from '../src/lib/components/haiti-map/public-data.ts';

const fallbackPath = 'src/lib/data/haiti-map/haiti-incidents-fallback.csv';
export async function fetchHaitiData() {
	let incidentsData;
	try {
		const response = await fetch(HAITI_FEED_URL, { signal: AbortSignal.timeout(15000) });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		incidentsData = parsePublicCsv(await response.text());
	} catch {
		console.warn('Haiti: using the sanitised local fallback.');
		incidentsData = parsePublicCsv(await fs.readFile(fallbackPath, 'utf8'));
	}
	// Persist only the explicit public projection, never the raw export.
	await fs.writeFile(fallbackPath, publicCsv(incidentsData));
	await fs.writeFile(
		'src/lib/data/haiti-map/cached-incidents.json',
		JSON.stringify({ incidentsData, buildTime: new Date().toISOString() }, null, 2)
	);
	console.log(`Haiti: ${incidentsData.length} public display records cached.`);
	return true;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	fetchHaitiData().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}

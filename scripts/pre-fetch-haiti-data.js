#!/usr/bin/env node
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseHaitiReview } from '../src/lib/components/haiti-map/review-data.ts';

const fallbackPath = 'src/lib/data/haiti-map/haiti-incidents-fallback.csv';
export async function fetchHaitiData() {
	// The current review uses only the curated 2025 source, never the broader live feed.
	const incidentsData = parseHaitiReview(await fs.readFile(fallbackPath, 'utf8'));
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

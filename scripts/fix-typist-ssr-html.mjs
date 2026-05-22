#!/usr/bin/env node
/**
 * @deprecated Use scripts/patch-annual-reports-no-typist.mjs instead.
 * Legacy helper: removed duplicate SSR text before TypistText (pre-no-typist patch).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const TYPIST_DUPLICATE_RE = />([^<]+?)<div class="TypistText">/g;

function fixFile(filePath) {
	const rel = path.relative(ROOT, filePath);
	let html = fs.readFileSync(filePath, 'utf8');
	const before = [...html.matchAll(TYPIST_DUPLICATE_RE)].filter((m) => m[1].trim());
	if (before.length === 0) {
		console.log(`  skip ${rel} (no duplicate text)`);
		return 0;
	}

	html = html.replace(TYPIST_DUPLICATE_RE, '><div class="TypistText">');
	fs.writeFileSync(filePath, html);
	console.log(`  fixed ${rel}: removed ${before.length} duplicate quote(s)`);
	for (const m of before) console.log(`    - "${m[1].trim()}"`);
	return before.length;
}

function main() {
	const reportsDir = path.join(ROOT, 'static/reports');
	const files = fs
		.readdirSync(reportsDir, { recursive: true })
		.filter((f) => f.endsWith('index.html'))
		.map((f) => path.join(reportsDir, f));

	let total = 0;
	console.log('Fixing Typist SSR duplicates…\n');
	for (const file of files) {
		total += fixFile(file);
	}
	console.log(`\nDone. ${total} duplicate(s) removed.`);
}

main();

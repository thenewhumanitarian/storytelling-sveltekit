#!/usr/bin/env node
/**
 * Smoke-test public URLs: local dev vs production.
 *
 * Prerequisites:
 *   pnpm dev   (https://localhost:5173 with mkcert)
 *
 * Usage:
 *   pnpm check:urls
 *   LOCAL_BASE=https://localhost:5174 pnpm check:urls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LOCAL_BASE = (process.env.LOCAL_BASE || 'https://localhost:5173').replace(/\/$/, '');
const PROD_BASE = (process.env.PROD_BASE || 'https://interactive.thenewhumanitarian.org').replace(
	/\/$/,
	''
);
const TIMEOUT_MS = Number(process.env.URL_CHECK_TIMEOUT || 30000);
const MAX_BODY_BYTES = 32768;
const REPORT_PATH = path.join(ROOT, 'URL-CHECK-REPORT.md');

const localAgent = new https.Agent({ rejectUnauthorized: false });

const BODY_ERROR_MARKERS = [
	'Failed to load',
	'500 Internal',
	'Internal Server Error',
	'This page could not be found',
	'ENOENT',
	'SvelteKit error'
];

/** @param {string} manifestPath */
function loadManifest(manifestPath) {
	const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	/** @type {Array<{path: string, group: string, name: string, expectStatus?: number, expectRedirect?: boolean, expectContentType?: string}>} */
	const entries = [...raw.entries];

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

/**
 * @param {string} url
 * @param {boolean} isLocal
 */
async function fetchUrl(url, isLocal) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const res = await fetch(url, {
			signal: controller.signal,
			redirect: 'follow',
			headers: { 'User-Agent': 'tnh-url-check/1.0' },
			...(isLocal ? { agent: localAgent } : {})
		});

		const contentType = res.headers.get('content-type') || '';
		let bodySnippet = '';
		if (contentType.includes('text/html') || contentType.includes('javascript')) {
			const reader = res.body?.getReader();
			if (reader) {
				const chunks = [];
				let total = 0;
				while (total < MAX_BODY_BYTES) {
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(value);
					total += value.length;
				}
				reader.cancel().catch(() => {});
				bodySnippet = Buffer.concat(chunks).toString('utf8');
			}
		}

		return {
			ok: true,
			status: res.status,
			finalUrl: res.url,
			contentType,
			bodySnippet
		};
	} catch (err) {
		return {
			ok: false,
			status: 0,
			finalUrl: url,
			contentType: '',
			bodySnippet: '',
			error: err instanceof Error ? err.message : String(err)
		};
	} finally {
		clearTimeout(timer);
	}
}

/**
 * @param {ReturnType<typeof loadManifest>[number]} entry
 * @param {{ status: number, bodySnippet: string, contentType: string, ok: boolean, error?: string }} local
 * @param {{ status: number, bodySnippet: string, contentType: string, ok: boolean, error?: string }} prod
 */
function classifyIssue(entry, local, prod) {
	if (!local.ok) return 'local_error';
	if (entry.expectStatus != null) {
		if (local.status !== entry.expectStatus) return 'local_unexpected_status';
		return null;
	}
	if (local.status >= 500) return 'local_5xx';
	if (local.status >= 400 && (prod.ok && prod.status < 400)) return 'local_4xx';
	if (prod.ok && local.status !== prod.status) return 'status_mismatch';
	if (entry.expectContentType === 'javascript' && !local.contentType.includes('javascript')) {
		return 'wrong_content_type';
	}
	if (local.bodySnippet && BODY_ERROR_MARKERS.some((m) => local.bodySnippet.includes(m))) {
		return 'error_in_body';
	}
	return null;
}

function statusLabel(status) {
	if (status === 0) return 'ERR';
	return String(status);
}

/**
 * @param {Array<{ entry: object, local: object, prod: object, issue: string | null }>} results
 */
function buildReport(results, now = new Date().toISOString()) {
	const broken = results.filter((r) => r.issue);
	const passed = results.filter((r) => !r.issue);

	const lines = [
		'# URL smoke-test report',
		'',
		`Generated: ${now}`,
		'',
		`| | |`,
		`| --- | --- |`,
		`| Local | ${LOCAL_BASE} |`,
		`| Production | ${PROD_BASE} |`,
		`| Total checked | ${results.length} |`,
		`| Passed | ${passed.length} |`,
		`| Issues | ${broken.length} |`,
		'',
		'## Summary by group',
		'',
		'| Group | Pass | Fail |',
		'| ----- | ---- | ---- |'
	];

	const groups = [...new Set(results.map((r) => r.entry.group))].sort();
	for (const group of groups) {
		const inGroup = results.filter((r) => r.entry.group === group);
		const fail = inGroup.filter((r) => r.issue).length;
		lines.push(`| ${group} | ${inGroup.length - fail} | ${fail} |`);
	}

	if (broken.length > 0) {
		lines.push('', '## Issues', '', '| Path | Local | Prod | Issue | Name |', '| ---- | ----- | ---- | ----- | ---- |');
		for (const { entry, local, prod, issue } of broken) {
			lines.push(
				`| \`${entry.path}\` | ${statusLabel(local.status)} | ${statusLabel(prod.status)} | ${issue} | ${entry.name} |`
			);
		}
	}

	lines.push('', '## Full results', '', '| Path | Local | Prod | Match | Name |', '| ---- | ----- | ---- | ----- | ---- |');
	for (const { entry, local, prod, issue } of results) {
		const match =
			issue == null ? 'ok' : local.status === prod.status ? 'status_only' : 'fail';
		lines.push(
			`| \`${entry.path}\` | ${statusLabel(local.status)} | ${statusLabel(prod.status)} | ${match} | ${entry.name} |`
		);
	}

	return lines.join('\n');
}

/**
 * Condensed archive for docs/ai/tests/
 * @param {Array<{ entry: object, local: object, prod: object, issue: string | null }>} results
 * @param {string} now ISO timestamp
 */
function buildArchiveSummary(results, now) {
	const broken = results.filter((r) => r.issue);
	const lines = [
		`# HTTP smoke — ${now}`,
		'',
		`| | |`,
		`| --- | --- |`,
		`| Local | ${LOCAL_BASE} |`,
		`| Production | ${PROD_BASE} |`,
		`| Checked | ${results.length} paths |`,
		`| Result | **${results.length - broken.length} pass, ${broken.length} fail** |`,
		'',
		'## By group',
		'',
		'| Group | Pass | Fail |',
		'| ----- | ---- | ---- |'
	];
	const groups = [...new Set(results.map((r) => r.entry.group))].sort();
	for (const group of groups) {
		const inGroup = results.filter((r) => r.entry.group === group);
		const fail = inGroup.filter((r) => r.issue).length;
		lines.push(`| ${group} | ${inGroup.length - fail} | ${fail} |`);
	}
	if (broken.length > 0) {
		lines.push('', '## Failures', '');
		for (const { entry, local, prod, issue } of broken) {
			lines.push(`- \`${entry.path}\` — local ${statusLabel(local.status)}, prod ${statusLabel(prod.status)} (${issue})`);
		}
	}
	lines.push(
		'',
		'## Manual QA',
		'',
		'HTTP status only. Use `pnpm check:playwright` for load/console checks on a subset.',
		'',
		'Full table: `URL-CHECK-REPORT.md` (gitignored).',
		''
	);
	return lines.join('\n');
}

async function main() {
	const manifestPath = path.join(__dirname, 'url-manifest.json');
	const entries = loadManifest(manifestPath);

	console.log(`Checking ${entries.length} URLs...`);
	console.log(`  Local: ${LOCAL_BASE}`);
	console.log(`  Prod:  ${PROD_BASE}\n`);

	/** @type {Array<{ entry: object, local: object, prod: object, issue: string | null }>} */
	const results = [];

	for (const entry of entries) {
		const localUrl = `${LOCAL_BASE}${entry.path}`;
		const prodUrl = `${PROD_BASE}${entry.path}`;

		process.stdout.write(`  ${entry.path} ... `);

		const [local, prod] = await Promise.all([
			fetchUrl(localUrl, true),
			fetchUrl(prodUrl, false)
		]);

		const issue = classifyIssue(entry, local, prod);
		results.push({ entry, local, prod, issue });

		if (issue) {
			console.log(`FAIL (${issue}) local=${statusLabel(local.status)} prod=${statusLabel(prod.status)}`);
		} else {
			console.log(`ok local=${statusLabel(local.status)} prod=${statusLabel(prod.status)}`);
		}
	}

	const now = new Date().toISOString();
	const report = buildReport(results, now);
	fs.writeFileSync(REPORT_PATH, report);

	const archiveDir = path.join(ROOT, 'docs/ai/tests');
	fs.mkdirSync(archiveDir, { recursive: true });
	const archiveTs = now.replace(/[:.]/g, '-').slice(0, 19) + 'Z';
	const archivePath = path.join(archiveDir, `${archiveTs}-url-smoke.md`);
	fs.writeFileSync(archivePath, buildArchiveSummary(results, now));

	console.log(`\nReport written to ${REPORT_PATH}`);
	console.log(`Archive: ${archivePath}`);

	const regressions = results.filter((r) => {
		if (!r.prod.ok || r.prod.status >= 400) return false;
		if (!r.local.ok) return true;
		if (r.entry.expectStatus != null) return r.local.status !== r.entry.expectStatus;
		return r.local.status >= 400 || r.issue === 'error_in_body' || r.issue === 'local_5xx';
	});

	if (regressions.length > 0) {
		console.log(`\n${regressions.length} regression(s) vs production.`);
		process.exit(1);
	}

	console.log('\nAll checks passed (or matched expected failures).');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

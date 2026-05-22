#!/usr/bin/env node
/**
 * Browser smoke: compare local dev vs production for representative pages.
 * Writes docs/ai/tests/{timestamp}-playwright.md
 *
 * Requires: pnpm dev running, playwright browsers installed once via:
 *   npx playwright install chromium
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LOCAL_BASE = (process.env.LOCAL_BASE || 'https://localhost:5173').replace(/\/$/, '');
const PROD_BASE = (process.env.PROD_BASE || 'https://interactive.thenewhumanitarian.org').replace(
	/\/$/,
	''
);
const TIMEOUT = Number(process.env.PW_TIMEOUT || 45000);

/** Representative pages for manual follow-up — one per project type */
const PAGES = [
	{ path: '/stories/2025/05/22/lebanon-displacement-diaries/home', group: 'lebanon', label: 'Lebanon EN home' },
	{
		path: '/stories/2025/05/22/lebanon-displacement-diaries/diaries/riham',
		group: 'lebanon',
		label: 'Lebanon diary (Riham)'
	},
	{
		path: '/stories/2026/03/24/india-assam-evictions-forced-displacement',
		group: 'cleared',
		label: 'Cleared / Assam'
	},
	{ path: '/embeddable/map/2025-09/gaza', group: 'gaza', label: 'Gaza map' },
	{ path: '/embeddable/map/2025-09/gaza/spotlight', group: 'gaza', label: 'Gaza spotlight' },
	{ path: '/embeddable/map/2024-11/syria/0', group: 'syria', label: 'Syria map marker 0' },
	{ path: '/embeddable/sharepoint/bluesky', group: 'embeds', label: 'Bluesky embed' },
	{ path: '/stories/2024/12/27/year-in-photos', group: 'gatsby-stories', label: 'Year in Photos (Gatsby)' },
	{ path: '/stories/2022/07/28/whatsapp-lebanon', group: 'gatsby-stories', label: 'WhatsApp Lebanon (Gatsby)' },
	{ path: '/reports/2024/07/25/annual-report-2023', group: 'gatsby-reports', label: 'Annual Report 2023' }
];

/**
 * @param {import('playwright').Page} page
 */
async function probe(page, url) {
	const consoleErrors = [];
	const pageErrors = [];

	page.on('console', (msg) => {
		if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
	});
	page.on('pageerror', (err) => pageErrors.push(String(err.message).slice(0, 200)));

	let response = null;
	try {
		response = await page.goto(url, {
			waitUntil: 'domcontentloaded',
			timeout: TIMEOUT
		});
		await page.waitForTimeout(1500);
	} catch (err) {
		return {
			ok: false,
			status: 0,
			title: '',
			h1: '',
			bodyLength: 0,
			consoleErrors,
			pageErrors,
			error: err instanceof Error ? err.message : String(err)
		};
	}

	const title = await page.title().catch(() => '');
	const h1 = await page
		.locator('h1')
		.first()
		.innerText()
		.catch(() => '');
	const bodyLength = await page
		.evaluate(() => document.body?.innerText?.length ?? 0)
		.catch(() => 0);

	return {
		ok: true,
		status: response?.status() ?? 0,
		title: title.slice(0, 120),
		h1: h1.slice(0, 80),
		bodyLength,
		consoleErrors: [...new Set(consoleErrors)].slice(0, 5),
		pageErrors: [...new Set(pageErrors)].slice(0, 3),
		error: null
	};
}

function compare(local, prod) {
	const issues = [];
	if (!local.ok) issues.push('local_load_failed');
	if (!prod.ok) issues.push('prod_load_failed');
	if (local.ok && prod.ok && local.status !== prod.status) issues.push('status_mismatch');
	if (local.ok && local.status >= 400) issues.push('local_http_error');
	if (local.consoleErrors.length > prod.consoleErrors.length + 2) issues.push('extra_console_errors_local');
	if (local.pageErrors.length > 0 && prod.pageErrors.length === 0) issues.push('page_errors_local_only');
	if (local.ok && prod.ok && local.bodyLength < 100 && prod.bodyLength > 500) issues.push('local_empty_body');
	return issues;
}

function buildMarkdown(timestamp, results) {
	const broken = results.filter((r) => r.issues.length > 0);
	const lines = [
		`# Playwright comparison — ${timestamp}`,
		'',
		`| | |`,
		`| --- | --- |`,
		`| Local | ${LOCAL_BASE} |`,
		`| Production | ${PROD_BASE} |`,
		`| Pages checked | ${results.length} (representative subset) |`,
		`| With issues | ${broken.length} |`,
		'',
		'## Manual test priority',
		'',
		'Focus manual QA on rows marked **check** below.',
		'',
		'| Page | Local | Prod | Issues | Notes |',
		'| ---- | ----- | ---- | ------ | ----- |'
	];

	for (const r of results) {
		const flag = r.issues.length ? '**check**' : 'ok';
		const notes = [];
		if (r.local.consoleErrors.length) notes.push(`local console: ${r.local.consoleErrors.length}`);
		if (r.local.pageErrors.length) notes.push(`local JS: ${r.local.pageErrors[0]}`);
		if (r.local.error) notes.push(r.local.error.slice(0, 60));
		lines.push(
			`| ${r.label} | ${r.local.status || 'ERR'} | ${r.prod.status || 'ERR'} | ${flag} ${r.issues.join(', ') || '—'} | ${notes.join('; ') || '—'} |`
		);
	}

	if (broken.length) {
		lines.push('', '## Detail', '');
		for (const r of broken) {
			lines.push(`### ${r.label}`, '', `- Path: \`${r.path}\``);
			lines.push(`- Local: ${LOCAL_BASE}${r.path}`);
			lines.push(`- Prod: ${PROD_BASE}${r.path}`);
			lines.push(`- Issues: ${r.issues.join(', ')}`);
			if (r.local.consoleErrors.length) {
				lines.push('- Local console errors:');
				for (const e of r.local.consoleErrors) lines.push(`  - \`${e}\``);
			}
			if (r.prod.consoleErrors.length) {
				lines.push('- Prod console errors:');
				for (const e of r.prod.consoleErrors) lines.push(`  - \`${e}\``);
			}
			lines.push('');
		}
	}

	lines.push(
		'',
		'## Full URL list',
		'',
		'See [`URLS.md`](../../../URLS.md) and run `pnpm check:urls` for all 54 HTTP checks.',
		''
	);
	return lines.join('\n');
}

async function main() {
	const { chromium } = await import('playwright');

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z';
	const outDir = path.join(ROOT, 'docs/ai/tests');
	fs.mkdirSync(outDir, { recursive: true });

	console.log(`Playwright compare: ${PAGES.length} pages`);
	console.log(`  Local: ${LOCAL_BASE}`);
	console.log(`  Prod:  ${PROD_BASE}\n`);

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage();

	/** @type {Array<object>} */
	const results = [];

	for (const { path: p, group, label } of PAGES) {
		process.stdout.write(`  ${label} ... `);
		const localUrl = `${LOCAL_BASE}${p}`;
		const prodUrl = `${PROD_BASE}${p}`;

		const local = await probe(page, localUrl);
		await page.goto('about:blank').catch(() => {});
		const prod = await probe(page, prodUrl);
		await page.goto('about:blank').catch(() => {});

		const issues = compare(local, prod);
		results.push({ path: p, group, label, local, prod, issues });

		console.log(issues.length ? `CHECK (${issues.join(', ')})` : 'ok');
	}

	await browser.close();

	const md = buildMarkdown(timestamp, results);
	const outPath = path.join(outDir, `${timestamp}-playwright.md`);
	fs.writeFileSync(outPath, md);
	console.log(`\nWrote ${outPath}`);

	if (results.some((r) => r.issues.some((i) => i.includes('local')))) process.exit(1);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

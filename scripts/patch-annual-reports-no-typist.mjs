#!/usr/bin/env node
/**
 * Disable react-typist on legacy Gatsby annual reports: show burgundy headlines
 * as static text (no cursor, no typing animation).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STATIC = path.join(ROOT, 'static');

const TYPIST_MODULE = path.join(
	STATIC,
	'44b6c6301b79d890be4ba2c5931d865cca96f236-e27204e6427e4e9928b0.js'
);

const TYPIST_OLD =
	't.A=e=>{var t;let{texts:n,typingSpeed:i=100}=e;const o="string"==typeof n?[n]:n,s=1===o.length,{0:u,1:a}=(0,r.useState)(0),{0:c,1:l}=(0,r.useState)(0),{0:f,1:h}=(0,r.useState)(!0),{0:d,1:p}=(0,r.useState)(!1),{0:v,1:y}=(0,r.useState)(!1);return(0,r.useEffect)((()=>{if(s&&c===o[0].length&&!d)return void y(!0);if(u>=o.length)return void a(0);if(c===o[u].length+1&&!d)return void setTimeout((()=>p(!0)),1500);if(0===c&&d)return s||a((e=>e+1)),void p(!1);const e=setTimeout((()=>{l((e=>e+(d?-1:1)))}),i);return()=>clearTimeout(e)}),[c,u,d,o,i,s]),(0,r.useEffect)((()=>{if(v)return;const e=setTimeout((()=>{h((e=>!e))}),500);return()=>clearTimeout(e)}),[f,v]),r.createElement("div",{className:"TypistText"},(null===(t=o[u])||void 0===t?void 0:t.substring(0,c))+(v?"":f?"|":" "))}';

const TYPIST_NEW =
	't.A=e=>{let{texts:n}=e;const o="string"==typeof n?[n]:n,t=o[0]||"";return r.createElement("span",{className:"TypistText"},t)}';

const ANNUAL_REPORT_2021_HTML = path.join(
	STATIC,
	'reports/2022/06/27/annual-report-2021/index.html'
);

/** Burgundy h2 quotes in chapter order (annual-report-2021). */
const QUOTES_2021 = [
	'Here\u2019s what we achieved.',
	'Building better journalism.',
	'In-depth, field-based perspectives on humanitarian crises.',
	'How our journalism creates real impact.',
	'Finding new ways to engage our readers.',
	'The foundations that position us for success.',
	'Looking to the future.'
];

const H2_TYPIST_RE =
	/(<h2 class="z-50 px-3 py-2 inline-block mx-auto text-white bg-burgundy text-center text-xl sm:text-5xl" style="margin-top:2\.8rem">)<div class="TypistText">\|<\/div><\/h2>/g;

function patchTypistModule() {
	let js = fs.readFileSync(TYPIST_MODULE, 'utf8');
	if (!js.includes(TYPIST_OLD)) {
		if (js.includes(TYPIST_NEW)) {
			console.log('  skip Typist module (already patched)');
			return;
		}
		throw new Error('Typist module pattern not found — bundle may have changed');
	}
	js = js.replace(TYPIST_OLD, TYPIST_NEW);
	fs.writeFileSync(TYPIST_MODULE, js);
	console.log('  patched shared Typist component → static text');
}

function patch2021Component() {
	const file = path.join(
		STATIC,
		'component---src-pages-reports-2022-06-27-annual-report-2021-index-js-a6dcc549e8e9cd84fc72.js'
	);
	let js = fs.readFileSync(file, 'utf8');

	const chapterHeaderOld = 'o.length>1?o[0]:o,n.createElement(d.A,{texts:o})';
	const chapterHeaderNew = 'Array.isArray(o)?o[0]:o';
	const inlineTypistOld = 'n.createElement(d.A,{texts:t})';
	const inlineTypistNew = 'Array.isArray(t)?t[0]:t';

	if (js.includes(chapterHeaderOld)) {
		js = js.replace(chapterHeaderOld, chapterHeaderNew);
		console.log('  patched annual-report-2021 ChapterHeader (removed duplicate Typist)');
	} else if (!js.includes(chapterHeaderNew + ',n.createElement')) {
		console.log('  skip annual-report-2021 ChapterHeader (already patched)');
	}

	if (js.includes(inlineTypistOld)) {
		js = js.replace(inlineTypistOld, inlineTypistNew);
		console.log('  patched annual-report-2021 InlineTypist → static text');
	}

	fs.writeFileSync(file, js);
}

function patch2021Html() {
	let html = fs.readFileSync(ANNUAL_REPORT_2021_HTML, 'utf8');
	let i = 0;
	html = html.replace(H2_TYPIST_RE, (_, open) => {
		const quote = QUOTES_2021[i++];
		return `${open}${quote}</h2>`;
	});

	if (i !== QUOTES_2021.length) {
		throw new Error(`Expected ${QUOTES_2021.length} h2 quotes, patched ${i}`);
	}

	fs.writeFileSync(ANNUAL_REPORT_2021_HTML, html);
	console.log(`  patched annual-report-2021 HTML (${i} static burgundy headlines)`);
}

function main() {
	console.log('Disabling annual report typing animations…\n');
	patchTypistModule();
	patch2021Component();
	patch2021Html();
	console.log('\nDone. Hard-refresh report pages to verify.');
}

main();

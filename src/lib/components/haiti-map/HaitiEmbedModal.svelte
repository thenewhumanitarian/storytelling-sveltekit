<script lang="ts">
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import type { HaitiLang } from './copy';
	import { copy } from './copy';
	let { onClose, lang = 'en' } = $props<{ onClose: () => void; lang?: HaitiLang }>();
	let copied = $state(false);
	const text = $derived(copy[lang === 'fr' ? 'fr' : 'en']);
	// Build base URL from env and ensure no trailing slash
	const BASE = (PUBLIC_BASE_URL || '').replace(/\/$/, '');
	// Script-based embed (served by endpoint)
	const embedSnippet = `<div id="haiti-drone-map"></div>\n<script src="${BASE}/embeddable/map/2026-08/haiti/embed" defer></${'script'}>`;

	async function copyEmbed() {
		if (typeof window === 'undefined') return;
		try {
			if (navigator && 'clipboard' in navigator) {
				await navigator.clipboard.writeText(embedSnippet);
				copied = true;
				setTimeout(() => (copied = false), 1500);
				return;
			}
		} catch {
			// Fall through to the selection-based clipboard fallback.
		}
		try {
			const el = document.getElementById('tnh-embed-code');
			if (!el) return;
			const range = document.createRange();
			range.selectNodeContents(el);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
			document.execCommand('copy');
			sel?.removeAllRanges();
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// Copy support is optional; leave the snippet selectable on failure.
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onclick={onClose}>
	<div
		role="dialog"
		aria-modal="true"
		aria-label={text.embedDialogLabel}
		class="relative w-full max-w-2xl bg-white p-4 text-gray-800 shadow-lg"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			class="absolute right-3 top-1 text-3xl leading-none text-gray-500 hover:text-gray-800"
			onclick={onClose}
			aria-label={text.close}>×</button
		>
		<h2 class="mb-2 text-lg font-semibold text-gray-900">{text.embedTitle}</h2>
		<p class="mb-3 text-sm text-gray-700">
			{text.embedIntro}
		</p>
		<ol class="list-decimal space-y-3 pl-5 text-sm">
			<li>
				<strong>{text.embedHtml}</strong>
				<div class="relative mt-1">
					<button
						type="button"
						class="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-white/90 px-2 py-1 text-[12px] font-medium text-gray-700 shadow-sm hover:bg-white"
						onclick={copyEmbed}
						aria-label={text.copyCode}
					>
						<svg
							class="h-3 w-3"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path
								d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
							></path></svg
						>
						{copied ? text.copied : text.copy}
					</button>
					<pre
						id="tnh-embed-code"
						class="overflow-auto rounded-sm bg-gray-100 p-2 text-[12px] text-gray-900"><code
							>{embedSnippet}</code
						></pre>
				</div>
			</li>
			<li>
				<strong>{text.embedWhatLabel}</strong>
				{text.embedWhat}
			</li>
			<li>
				<strong>{text.embedOptional}</strong>
				{text.embedOptionalHelp}
			</li>
		</ol>
	</div>
</div>

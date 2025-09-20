<script lang="ts">
	let { onClose } = $props<{ onClose: () => void }>();
	let copied = $state(false);
	// Script-based embed (served from static/ as /scripts/... on Vercel)
	const embedSnippet = `<div id="gaza-aid-killings"></div>\n<script src="https://interactive.thenewhumanitarian.org/scripts/gaza-data-piece/dashboard-embed.js" defer><\/script>`;

	async function copyEmbed() {
		if (typeof window === 'undefined') return;
		try {
			if (navigator && 'clipboard' in navigator) {
				await navigator.clipboard.writeText(embedSnippet);
				copied = true;
				setTimeout(() => (copied = false), 1500);
				return;
			}
		} catch {}
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
		} catch {}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onclick={onClose}>
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Embed options"
		class="relative w-full max-w-2xl bg-white p-4 text-gray-800 shadow-lg"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			class="absolute right-3 top-1 text-3xl leading-none text-gray-500 hover:text-gray-800"
			onclick={onClose}
			aria-label="Close">×</button
		>
		<h2 class="mb-2 text-lg font-semibold text-gray-900">Embed this dashboard</h2>
		<p class="mb-3 text-sm text-gray-700">
			Copy and paste the following into your CMS or HTML page.
		</p>
		<ol class="list-decimal space-y-3 pl-5 text-sm">
			<li>
				<strong>HTML:</strong>
				<div class="relative mt-1">
					<button
						type="button"
						class="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[12px] font-medium text-gray-700 shadow hover:bg-white"
						onclick={copyEmbed}
						aria-label="Copy code"
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
						{copied ? 'Copied' : 'Copy'}
					</button>
					<pre
						id="tnh-embed-code"
						class="overflow-auto rounded bg-gray-100 p-2 text-[12px] text-gray-900"><code
							>&lt;div id="gaza-aid-killings"&gt;&lt;/div&gt;
&lt;script src="https://interactive.thenewhumanitarian.org/scripts/gaza-data-piece/dashboard-embed.js" defer&gt;&lt;/script&gt;</code
						></pre>
				</div>
			</li>
			<li>
				<strong>What it does:</strong> injects a responsive iframe with a loading shimmer and the correct
				aspect ratio for different screen sizes.
			</li>
			<li>
				<strong>Optional:</strong> You can change the target container id by adding <code>data-target="your-id"</code>
				and the source via <code>data-src="..."</code> to the script tag; then use
				<code>&lt;div id="your-id"&gt;&lt;/div&gt;</code>.
			</li>
		</ol>
	</div>
</div>

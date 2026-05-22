<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="events-root min-h-svh bg-[var(--event-bg,#f5f0eb)] text-[var(--event-ink,#1a1210)]">
	{@render children()}
</div>

<style>
	:global(html),
	:global(body) {
		overflow-x: clip;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}
	}

	.events-root {
		--event-bg: #f5f0eb;
		--event-bg-soft: #ebe4dc;
		--event-ink: #1a1210;
		--event-ink-muted: #4a403c;
		--event-accent: #8b2942;
		--event-hero-bg: #1a1210;
		--event-nav-h: 4rem;
		font-family: 'proxima-nova', system-ui, sans-serif;
	}

	.events-root :global(.font-serif) {
		font-family: 'GT Sectra Bold', Georgia, serif;
	}
</style>

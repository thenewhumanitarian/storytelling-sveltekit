<script lang="ts">
	import { onMount } from 'svelte';
	import { createInlineCheckoutWidget } from '$lib/utils/eventbrite-widget';

	interface Props {
		eventId: string;
		containerId?: string;
		height?: number;
		accentColor?: string;
		backgroundColor?: string;
		inkColor?: string;
	}

	let {
		eventId,
		containerId = 'eventbrite-checkout',
		height = 520,
		accentColor = '#8b2942',
		backgroundColor = '#f5f0eb',
		inkColor = '#1a1210'
	}: Props = $props();

	let loadError = $state<string | null>(null);

	onMount(() => {
		let cancelled = false;

		createInlineCheckoutWidget({
			eventId,
			iframeContainerId: containerId,
			iframeContainerHeight: height,
			iframeAutoAdapt: 100,
			themeSettings: {
				brandColor: accentColor,
				fontColor: inkColor,
				background: backgroundColor
			},
			onOrderComplete: () => {
				// Reserved for analytics hooks
			}
		}).catch((error: unknown) => {
			if (cancelled) return;
			loadError = error instanceof Error ? error.message : 'Checkout could not be loaded';
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="w-full">
	{#if loadError}
		<p
			class="border border-[var(--event-accent)]/20 bg-white px-4 py-3 font-sans text-sm text-[var(--event-ink-muted)]"
		>
			{loadError}. You can still register on
			<a
				href="https://www.eventbrite.com/e/{eventId}"
				class="font-semibold text-[var(--event-accent)] underline-offset-2 hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				Eventbrite
			</a>.
		</p>
	{/if}

	<div
		id={containerId}
		class="eventbrite-checkout min-h-[425px] w-full overflow-hidden border border-[var(--event-ink)]/10 bg-white shadow-sm"
		aria-label="Event registration checkout"
	></div>
</div>

<noscript>
	<p class="font-sans text-sm text-[var(--event-ink-muted)]">
		Enable JavaScript to register on this page, or
		<a
			href="https://www.eventbrite.com/e/{eventId}"
			class="font-semibold text-[var(--event-accent)] underline-offset-2 hover:underline"
			target="_blank"
			rel="noopener noreferrer"
		>
			register on Eventbrite
		</a>.
	</p>
</noscript>

<style>
	:global(.eventbrite-checkout > iframe[src*='checkout-external']) {
		width: 100% !important;
		display: block !important;
		border: 0 !important;
	}
</style>

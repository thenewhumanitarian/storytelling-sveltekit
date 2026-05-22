<script lang="ts">
	import type { EventSpeaker } from '$lib/events/types';
	import EventResponsiveImage from '$lib/components/events/EventResponsiveImage.svelte';

	interface Props {
		speaker?: EventSpeaker;
	}

	let { speaker }: Props = $props();

	const initials = $derived(
		speaker
			? speaker.name
					.split(' ')
					.map((part) => part[0])
					.slice(0, 2)
					.join('')
			: ''
	);
</script>

{#if speaker}
	<figure class="speaker-portrait event-dot-card relative mx-auto w-full max-w-[20rem]">
		<div
			class="speaker-portrait-frame relative aspect-square overflow-hidden bg-[#ddd6ce] shadow-2xl ring-1 ring-[var(--event-ink)]/12"
		>
			{#if speaker.image}
				<div class="speaker-pattern-layer" aria-hidden="true"></div>
				{#key speaker.id}
					<EventResponsiveImage
						src={speaker.image}
						alt={speaker.imageAlt ?? speaker.name}
						sizes="(min-width: 1024px) 20rem, 80vw"
						loading="lazy"
						reserveSpace={false}
						class="speaker-photo-layer relative z-10 h-full w-full"
						imgClass="object-contain object-bottom grayscale"
					/>
				{/key}
			{:else}
				<div
					class="flex h-full w-full items-center justify-center bg-linear-to-br from-[var(--event-accent)] to-[var(--event-ink)] font-serif text-5xl text-white"
				>
					{initials}
				</div>
			{/if}
		</div>
		<figcaption class="sr-only">{speaker.name}</figcaption>
	</figure>
{/if}

<style>
	.speaker-portrait-frame::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(to top, rgb(160 60 80 / 0.28), transparent 42%),
			radial-gradient(ellipse at 16% 18%, rgb(245 240 235 / 0.38), transparent 42%);
		mix-blend-mode: multiply;
	}

	.speaker-pattern-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
		background-image: url('/images/events/who-owns-the-narrative/patterns/dot-pattern.png');
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		opacity: 0.9;
	}

	:global(.speaker-photo-layer) {
		animation: speaker-photo-in 620ms cubic-bezier(0.22, 0.8, 0.2, 1) both;
	}

	.speaker-portrait-frame :global(.speaker-photo-layer img) {
		position: relative;
		z-index: 1;
	}

	@keyframes speaker-photo-in {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.speaker-photo-layer) {
			animation: none;
		}
	}
</style>

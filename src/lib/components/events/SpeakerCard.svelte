<script lang="ts">
	import type { EventSpeaker } from '$lib/events/types';
	import EventResponsiveImage from '$lib/components/events/EventResponsiveImage.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		speaker: EventSpeaker;
		large?: boolean;
	}

	let { speaker, large = false }: Props = $props();

	const initials = $derived(
		speaker.name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('')
	);
</script>

<article
	class={cn('flex w-full items-start text-left', large ? 'gap-6 md:gap-8' : 'gap-4 md:gap-5')}
>
	<div
		class={cn(
			'speaker-thumb relative shrink-0 overflow-hidden bg-[var(--event-bg)] shadow-md ring-1 ring-[var(--event-ink)]/10',
			large ? 'h-36 w-36 md:h-44 md:w-44 lg:h-48 lg:w-48' : 'h-24 w-24 md:h-28 md:w-28'
		)}
	>
		{#if speaker.image}
			<div class="speaker-thumb-pattern" aria-hidden="true"></div>
			{#key speaker.id}
				<EventResponsiveImage
					src={speaker.image}
					alt={speaker.imageAlt ?? speaker.name}
					sizes={large ? '(min-width: 1024px) 12rem, 6rem' : '(min-width: 768px) 7rem, 6rem'}
					loading="lazy"
					reserveSpace={false}
					class="speaker-thumb-photo relative z-10 h-full w-full"
					imgClass="object-contain object-bottom grayscale"
				/>
			{/key}
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-linear-to-br from-[var(--event-accent)] to-[var(--event-ink)] font-serif text-white"
				class:text-3xl={large}
				class:text-xl={!large}
			>
				{initials}
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1 pt-0.5">
		<h3
			class={cn(
				'font-serif leading-tight tracking-tight text-[var(--event-ink)]',
				large ? 'text-2xl md:text-3xl lg:text-[2rem]' : 'text-xl md:text-2xl'
			)}
		>
			{speaker.name}
		</h3>
		<p
			class={cn(
				'mt-2 font-sans font-medium leading-snug text-[var(--event-accent)]',
				large ? 'text-sm md:text-base' : 'text-sm'
			)}
		>
			{speaker.role}
		</p>
		{#if speaker.bio && large}
			<p
				class="mt-4 font-sans text-sm leading-relaxed text-[var(--event-ink-muted)] md:text-[0.9375rem] md:leading-7"
			>
				{speaker.bio}
			</p>
		{/if}
	</div>
</article>

<style>
	.speaker-thumb-pattern {
		position: absolute;
		inset: 0;
		z-index: 0;
		background-image: url('/images/events/who-owns-the-narrative/patterns/dot-pattern.png');
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		opacity: 0.9;
	}

	:global(.speaker-thumb-photo) {
		animation: speaker-thumb-photo-in 520ms cubic-bezier(0.22, 0.8, 0.2, 1) both;
	}

	.speaker-thumb :global(.speaker-thumb-photo img) {
		position: relative;
		z-index: 1;
	}

	@keyframes speaker-thumb-photo-in {
		from {
			opacity: 0;
			transform: translateY(0.45rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.speaker-thumb-photo) {
			animation: none;
		}
	}
</style>

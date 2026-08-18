<script lang="ts">
	import HaitiSourcesOverlay from './HaitiSourcesOverlay.svelte';
	import moment from 'moment';
	import 'moment/locale/fr';
	import HaitiVideo from './HaitiVideo.svelte';
	import type { IncidentData } from './types';
	import type { HaitiLang } from './copy';
	import { casualtyLabel, copy, explosiveDroneLabel, totalDroneLabel } from './copy';
	import { Drone } from '@lucide/svelte';

	let {
		incident,
		selectedMarkerId,
		incidentsData,
		lang = 'en',
		isLast = false,
		goToPrevCard = null,
		goToNextCard = null,
		hasPrev = false,
		hasNext = false
	} = $props<{
		incident: IncidentData;
		selectedMarkerId: number | null;
		incidentsData: IncidentData[];
		lang?: HaitiLang;
		isLast?: boolean;
		goToPrevCard?: (() => void) | null;
		goToNextCard?: (() => void) | null;
		hasPrev?: boolean;
		hasNext?: boolean;
	}>();

	let showSources = $state(false);
	let hasAutoOpened = $state(false);
	const text = $derived(copy[lang === 'fr' ? 'fr' : 'en']);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const debug = new URLSearchParams(window.location.search).get('debug');
		const shouldAutoOpen =
			debug === 'sources' &&
			incident?.type === 'incident' &&
			incident?.sources &&
			incident.sources.trim() !== '' &&
			incident?.chronoId === selectedMarkerId;

		if (!hasAutoOpened && shouldAutoOpen) {
			showSources = true;
			hasAutoOpened = true;
		}
	});

	$effect(() => {
		moment.locale(lang === 'fr' ? 'fr' : 'en-gb');
	});

	const cumulativeDrones = $derived(() => {
		const currentDate = new Date(incident.date);
		return incidentsData
			.filter(
				(otherIncident: IncidentData) =>
					otherIncident.type === 'incident' && new Date(otherIncident.date) <= currentDate
			)
			.reduce(
				(sum: number, otherIncident: IncidentData) => sum + (otherIncident.droneCount || 0),
				0
			);
	});
</script>

<div
	class={`${incident.chronoId === selectedMarkerId && incident.type !== 'event' ? 'bg-zinc-50' : ''} stack-cards__item js-stack-cards__item my-4 overflow-hidden border border-zinc-400 ${incident.type === 'event' ? 'bg-burgundy/20' : 'bg-white'} relative p-3 transition-colors duration-200 sm:mx-4 sm:cursor-default ${isLast ? 'mb-14 sm:mb-14' : ''}`}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<div class="flex items-center justify-between gap-2 sm:gap-2">
			<div class="flex items-center gap-2">
				<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">{text.event}</span>
				<span class="text-sm text-zinc-700">
					{moment(incident.date).format('DD MMMM YYYY')}
				</span>
			</div>
			<!-- Mobile arrows -->
			<div class="flex gap-1 sm:hidden">
				<button
					class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
					onclick={goToPrevCard}
					disabled={!hasPrev}
					aria-label={text.previous}
				>
					←
				</button>
				<button
					class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
					onclick={goToNextCard}
					disabled={!hasNext}
					aria-label={text.next}
				>
					→
				</button>
			</div>
		</div>
		<div class="mb-3">
			<h3 class="mt-2 line-clamp-2 text-lg font-bold leading-tight sm:text-xl">
				{incident.title}
			</h3>
			<p class="hidden text-xs text-zinc-700 sm:block sm:text-base lg:text-lg">
				{incident.description}
			</p>
		</div>
		<slot name="readmore"></slot>
	{:else}
		<div
			class={`${incident.chronoId === selectedMarkerId ? '' : 'sm:opacity-30'} flex h-full flex-col`}
		>
			<!-- Top content area - grows to fill available space -->
			<div class="grow">
				<div class="flex items-center justify-between gap-2 sm:gap-2">
					<div class="flex items-center gap-2">
						<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">{text.incident}</span>
						<span class="text-sm text-zinc-700">
							{moment(incident.date).format('DD MMMM YYYY')}
						</span>
					</div>
					<!-- Mobile arrows -->
					<div class="flex gap-1 sm:hidden">
						<button
							class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
							onclick={goToPrevCard}
							disabled={!hasPrev}
							aria-label={text.previous}
						>
							←
						</button>
						<button
							class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
							onclick={goToNextCard}
							disabled={!hasNext}
							aria-label={text.next}
						>
							→
						</button>
					</div>
				</div>
				<div class="mb-3">
					<h3 class="mt-2 line-clamp-1 text-base font-bold leading-tight sm:text-xl lg:text-xl">
						{incident.title}
					</h3>
					<div class="mb-2 flex flex-wrap gap-1">
						<span
							class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-900"
						>
							<Drone size={14} strokeWidth={2} aria-hidden="true" />
							{explosiveDroneLabel(incident.droneCount || 0, lang)}
						</span>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
						>
							<Drone size={14} strokeWidth={2} aria-hidden="true" />
							{totalDroneLabel(cumulativeDrones(), lang)}
						</span>
						{#if incident.casualtyKnown && (incident.killed || incident.wounded)}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-burgundy/10 px-2 py-1 text-xs font-medium text-burgundy"
							>
								{casualtyLabel(incident.killed || 0, incident.wounded || 0, lang)}
							</span>
						{:else if !incident.casualtyKnown}
							<span
								class="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-500"
							>
								{text.casualtiesUnknown}
							</span>
						{/if}
					</div>
				</div>
				{#if incident.videoUrl && incident.videoUrl.trim() !== ''}
					<div class="mb-2 hidden sm:block">
						<HaitiVideo
							videoUrl={incident.videoUrl}
							imageUrl={incident.imageUrl}
							title={incident.title}
							videoCaption={incident.videoCaption}
							rounded={false}
							autoplay={false}
							mediaClass="aspect-video video relative mt-2 w-full"
							ctaCompact={true}
						/>
						{#if incident.videoCaption}
							<p
								class="hidden px-2 pt-1 text-sm text-zinc-400 sm:line-clamp-none sm:block sm:text-base"
							>
								{incident.videoCaption}
							</p>
						{/if}
					</div>
				{:else if incident.imageUrl && incident.imageUrl.trim() !== ''}
					<div class="mb-2 hidden sm:block">
						<a
							href={incident.imageUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="block"
							aria-label="Open image in new window"
						>
							<img
								class="aspect-video video relative mt-2 w-full"
								src={incident.imageUrl}
								alt={incident.imageCaption || incident.title}
							/>
						</a>
						{#if incident.imageCaption}
							<p
								class="hidden px-2 pt-1 text-sm text-zinc-400 sm:line-clamp-none sm:block sm:text-base"
							>
								{incident.imageCaption}
							</p>
						{/if}
					</div>
				{/if}
				<p
					class="hidden text-xs leading-tight text-zinc-700 sm:line-clamp-none sm:block sm:text-base lg:text-lg"
				>
					{incident.description}
				</p>
			</div>

			<!-- Bottom area - stays at bottom -->
			{#if incident.sources && incident.sources.trim() !== ''}
				<div class="mt-3 hidden border-t border-dashed border-zinc-300 sm:block">
					<!-- Desktop Show sources button -->
					<div class="sm:mt-4 sm:flex sm:justify-start">
						<button
							class="bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
							onclick={() => (showSources = true)}
						>
							{text.showSources}
						</button>
					</div>

					<!-- Mobile buttons slot -->
				</div>
			{/if}
			<slot name="readmore"></slot>
		</div>
	{/if}

	{#if showSources}
		<HaitiSourcesOverlay {incident} {lang} onClose={() => (showSources = false)} />
	{/if}
</div>

<style lang="postcss">
	.stack-cards__item {
		min-height: 50svh; /* Use svh for better viewport handling */
		transform-origin: center top;
		transition: transform 0.2s ease;
		position: relative; /* Ensure the card is a positioning context for the overlay */
	}

	@media (width <= 640px) {
		.stack-cards__item {
			top: 0; /* Remove top offset on mobile */
			min-height: 180px; /* Fixed height for iframe consistency */
			height: auto; /* Allow content to determine height */
			margin-bottom: 0.5rem; /* Reduced bottom margin on mobile */
		}
	}

	.video {
		aspect-ratio: 16/9;
	}

	/* Style links within the card descriptions */
	:global(.stack-cards__item a) {
		font-weight: bold;
		text-decoration: underline;
		color: #9f3e52; /* burgundy color to match the theme */
		transition: color 0.2s ease;
	}

	:global(.stack-cards__item a:hover) {
		color: #7c2d3f; /* darker burgundy on hover */
		text-decoration: underline;
	}

	:global(.stack-cards__item a:focus) {
		outline: 2px solid #9f3e52;
		outline-offset: 2px;
	}
</style>

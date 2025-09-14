<script>
	import GazaSourcesOverlay from './GazaSourcesOverlay.svelte';
	import moment from 'moment';
	import GazaVideo from './GazaVideo.svelte';

	let {
		incident,
		selectedMarkerId,
		incidentsData,
		goToPrevCard = null,
		goToNextCard = null,
		hasPrev = false,
		hasNext = false
	} = $props();

	let showSources = $state(false);

	// Calculate cumulative killed/wounded count up to this date
	const cumulativeKilledWounded = $derived(() => {
		const currentDate = new Date(incident.date);
		return incidentsData
			.filter(
				(otherIncident) =>
					otherIncident.type === 'incident' && new Date(otherIncident.date) <= currentDate
			)
			.reduce((sum, otherIncident) => sum + (otherIncident.killedOrWounded || 0), 0);
	});
</script>

<div
	class={`${incident.chronoId === selectedMarkerId && incident.type !== 'event' ? 'bg-zinc-50' : ''} stack-cards__item js-stack-cards__item my-4 overflow-hidden border border-zinc-400 ${incident.type === 'event' ? 'bg-burgundy/20' : 'bg-white'} relative p-3 transition-colors duration-200 sm:mx-4 sm:cursor-default`}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<div class="flex items-center justify-between gap-2 sm:gap-2">
			<div class="flex items-center gap-2">
				<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">Event</span>
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
					aria-label="Previous"
				>
					←
				</button>
				<button
					class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
					onclick={goToNextCard}
					disabled={!hasNext}
					aria-label="Next"
				>
					→
				</button>
			</div>
		</div>
		<div class="mb-3">
			<h3 class="mt-2 line-clamp-2 text-lg font-bold leading-tight sm:text-xl">
				{incident.title}
			</h3>
			{#if incident.description && incident.description.includes('<')}
				<div class="hidden text-xs text-zinc-700 sm:block sm:text-base lg:text-lg">
					{@html incident.description}
				</div>
			{:else}
				<p class="hidden text-xs text-zinc-700 sm:block sm:text-base lg:text-lg">
					{incident.description}
				</p>
			{/if}
		</div>
		<slot name="readmore"></slot>
	{:else}
		<div
			class={`${incident.chronoId === selectedMarkerId ? '' : 'sm:opacity-30'} flex h-full flex-col`}
		>
			<!-- Top content area - grows to fill available space -->
			<div class="flex-grow">
				<div class="flex items-center justify-between gap-2 sm:gap-2">
					<div class="flex items-center gap-2">
						<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">Incident</span>
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
							aria-label="Previous"
						>
							←
						</button>
						<button
							class="px-2 py-1 text-lg text-zinc-500 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50"
							onclick={goToNextCard}
							disabled={!hasNext}
							aria-label="Next"
						>
							→
						</button>
					</div>
				</div>
				<div class="mb-3">
					<h3 class="mt-2 line-clamp-1 text-base font-bold leading-tight sm:text-xl lg:text-xl">
						{incident.title}
					</h3>
					<div class="mb-2">
						<span
							class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
						>
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							{incident.killedOrWounded} killed/wounded, {cumulativeKilledWounded().toLocaleString('en-GB')} total
						</span>
					</div>
				</div>
				{#if incident.videoUrl && incident.videoUrl.trim() !== ''}
					<div class="mb-2 hidden sm:block">
						<GazaVideo
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
				{#if incident.description && incident.description.includes('<')}
					<div
						class="hidden text-xs leading-tight text-zinc-700 sm:line-clamp-none sm:block sm:text-base lg:text-lg"
					>
						{@html incident.description}
					</div>
				{:else}
					<p
						class="hidden text-xs leading-tight text-zinc-700 sm:line-clamp-none sm:block sm:text-base lg:text-lg"
					>
						{incident.description}
					</p>
				{/if}
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
							Show sources
						</button>
					</div>

					<!-- Mobile buttons slot -->
				</div>
			{/if}
			<slot name="readmore"></slot>
		</div>
	{/if}

	{#if showSources}
		<GazaSourcesOverlay {incident} onClose={() => (showSources = false)} />
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

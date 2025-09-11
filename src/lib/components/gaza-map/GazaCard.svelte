<script>
	import GazaSourcesOverlay from './GazaSourcesOverlay.svelte';
	import moment from 'moment';
	
	let {
		incident,
		selectedMarkerId,
		goToPrevCard = null,
		goToNextCard = null,
		hasPrev = false,
		hasNext = false
	} = $props();
	
	let showSources = $state(false);
</script>

<div
	class={`${incident.chronoId === selectedMarkerId && incident.type !== 'event' ? "bg-zinc-50" : ""} stack-cards__item js-stack-cards__item my-4 overflow-hidden border border-zinc-400 ${incident.type === 'event' ? 'bg-burgundy/20' : 'bg-white'} p-3 transition-colors duration-200 sm:mx-4 sm:cursor-default relative`}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<div class="flex items-center justify-between gap-2 sm:gap-2 ">
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
				<div class="hidden text-sm text-zinc-700 sm:block sm:text-lg">
					{@html incident.description}
				</div>
			{:else}
				<p class="hidden text-sm text-zinc-700 sm:block sm:text-lg">{incident.description}</p>
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
					<h3 class="mt-2 line-clamp-1 text-lg font-bold leading-tight sm:text-xl">
						{incident.title}
					</h3>
					<h5 class="mb-2 text-sm italic text-zinc-600 sm:text-base">
						{incident.killedOrWounded} killed/wounded
					</h5>
				</div>
				{#if incident.videoUrl && incident.videoUrl.trim() !== ''}
					<div class="mb-2 hidden sm:block">
						<video
							class="aspect-video video relative mt-2 w-full rounded-lg"
							src={incident.videoUrl}
							controls
							aria-label={incident.videoCaption || incident.title}
						></video>
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
						<img
							class="aspect-video video relative mt-2 w-full rounded-lg"
							src={incident.imageUrl}
							alt={incident.imageCaption || incident.title}
						/>
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
						class="hidden text-sm leading-tight text-zinc-700 sm:line-clamp-none sm:block sm:text-lg"
					>
						{@html incident.description}
					</div>
				{:else}
					<p
						class="hidden text-sm leading-tight text-zinc-700 sm:line-clamp-none sm:block sm:text-lg"
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

<script>
	let {
		incident,
		selectedMarkerId,
		goToPrevCard = null,
		goToNextCard = null,
		hasPrev = false,
		hasNext = false
	} = $props();
	import moment from 'moment';
</script>

<div
	class={'${incident.chronoId === selectedMarkerId ? "bg-zinc-200" : ""} stack-cards__item js-stack-cards__item my-4 overflow-hidden border border-zinc-400 bg-white p-3 transition-colors duration-200 sm:mx-4 sm:cursor-default'}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<div class="flex items-center justify-between gap-2 sm:gap-2">
			<div class="flex items-center gap-2">
				<span class="px-2 py-1 text-sm font-bold text-white bg-burgundy">Event</span>
				<span class="text-sm text-gray-700">
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
		<h3 class="mt-2 mb-1 text-lg font-bold leading-tight line-clamp-1 sm:text-xl">{incident.title}</h3>
		{#if incident.description && incident.description.includes('<')}
			<div class="hidden text-sm text-gray-700 sm:block sm:text-lg">
				{@html incident.description}
			</div>
		{:else}
			<p class="hidden text-sm text-gray-700 sm:block sm:text-lg">{incident.description}</p>
		{/if}
		<slot name="readmore"></slot>
	{:else}
		<div class={`${incident.chronoId === selectedMarkerId ? '' : 'sm:opacity-30'}`}>
			<div class="flex items-center justify-between gap-2 sm:gap-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-1 text-sm font-bold text-white bg-burgundy">Incident</span>
					<span class="text-sm text-gray-700">
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
			<h3 class="mt-2 mb-1 text-lg font-bold leading-tight line-clamp-1 sm:text-xl">{incident.title}</h3>
			<h5 class="mb-2 text-sm italic text-gray-600 sm:text-base">
				{incident.killedOrWounded} killed/wounded
			</h5>
			<slot name="readmore" />
			{#if incident.videoUrl}
				<div class="hidden sm:block">
					<video
						class="relative w-full mt-2 rounded-lg aspect-video video"
						src={incident.videoUrl}
						controls
						aria-label={incident.videoCaption || incident.title}
					></video>
				</div>
			{:else if incident.imageUrl}
				<div class="hidden sm:block">
					<img
						class="relative w-full mt-2 rounded-lg aspect-video video"
						src={incident.imageUrl}
						alt={incident.imageCaption || incident.title}
					/>
				</div>
			{/if}
			{#if incident.description && incident.description.includes('<')}
				<div
					class="hidden text-sm leading-tight text-gray-700 sm:line-clamp-none sm:block sm:text-lg"
				>
					{@html incident.description}
				</div>
			{:else}
				<p
					class="hidden text-sm leading-tight text-gray-700 sm:line-clamp-none sm:block sm:text-lg"
				>
					{incident.description}
				</p>
			{/if}
			{#if incident.videoCaption}
				<p class="hidden pt-1 text-sm text-zinc-500 sm:line-clamp-none sm:block sm:text-lg">
					{incident.videoCaption}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.stack-cards__item {
		top: 2.5rem;
		min-height: calc(70vh - 10rem);
		min-height: calc(70svh - 10rem);
		transform-origin: center top;
		transition: transform 0.2s ease;
	}

	@media (width <= 640px) {
		.stack-cards__item {
			min-height: calc(100% - 32px);
		}
	}

	.video {
		aspect-ratio: 16/9;
	}
</style>

<script>
	let { incident, selectedMarkerId } = $props();
	import moment from 'moment';
</script>

<div
	class="stack-cards__item js-stack-cards__item mx-4 my-4 overflow-hidden border border-zinc-400 bg-white p-4 transition-colors duration-200 sm:h-auto"
	class:bg-zinc-100={incident.chronoId === selectedMarkerId}
	class:border-burgundy={incident.type === 'event'}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<div class="flex items-center gap-2">
			<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">Event</span>
			<span class="text-sm text-gray-700">
				{moment(incident.date).format('DD MMMM YYYY')}
			</span>
		</div>
		<h3 class="mb-1 mt-2 text-lg font-bold leading-tight sm:text-xl">{incident.title}</h3>
		{#if incident.description && incident.description.includes('<')}
			<div class="hidden text-sm text-gray-700 sm:block sm:text-lg">
				{@html incident.description}
			</div>
		{:else}
			<p class="hidden text-sm text-gray-700 sm:block sm:text-lg">{incident.description}</p>
		{/if}
		<slot name="readmore" />
	{:else}
		<div
			class:opacity-100={incident.chronoId === selectedMarkerId}
			class:opacity-30={incident.chronoId !== selectedMarkerId}
		>
			<!-- <p class="hidden font-mono text-sm text-zinc-500">
				﹟ ID: {incident.id} | ⏱ ChronoID: {incident.chronoId} | Date: {moment(
					incident.date
				).format('DD MMMM YYYY')}
			</p> -->
			<div class="flex items-center gap-2">
				<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">Incident</span>
				<span class="text-sm text-gray-700">
					{moment(incident.date).format('DD MMMM YYYY')}
				</span>
			</div>
			<h3 class="mb-1 mt-2 text-lg font-bold leading-tight sm:text-xl">{incident.title}</h3>
			<h5 class="mb-2 text-sm italic text-gray-600 sm:text-base">
				{incident.killedOrWounded} killed/wounded
			</h5>
			<slot name="readmore" />
			{#if incident.videoUrl}
				<div class="hidden sm:block">
					<video
						class="aspect-video video relative mt-2 w-full rounded-lg"
						src={incident.videoUrl}
						controls
						aria-label={incident.videoCaption || incident.title}
					></video>
				</div>
			{:else if incident.imageUrl}
				<div class="hidden sm:block">
					<img
						class="aspect-video video relative mt-2 w-full rounded-lg"
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

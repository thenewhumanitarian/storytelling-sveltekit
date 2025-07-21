<script>
	import moment from 'moment';
	let { incident, selectedMarkerId } = $props();
</script>

<div
	class="stack-cards__item js-stack-cards__item mx-4 my-4 border bg-white p-4"
	class:bg-zinc-100={incident.type === 'event'}
	class:border-zinc-400={incident.type === 'event'}
	class:overflow-hidden={incident.type === 'event'}
	data-id={incident.chronoId}
>
	{#if incident.type === 'event'}
		<h3 class="mb-1 text-lg font-bold">{incident.title}</h3>
		{#if incident.description && incident.description.includes('<')}
			<div class="text-sm text-gray-700">{@html incident.description}</div>
		{:else}
			<p class="text-sm text-gray-700">{incident.description}</p>
		{/if}
	{:else}
		<div
			class="bg-white"
			class:opacity-100={incident.chronoId === selectedMarkerId}
			class:opacity-30={incident.chronoId !== selectedMarkerId}
		>
			<p class="font-mono text-sm text-zinc-500">
				﹟ ID: {incident.id} | ⏱ ChronoID: {incident.chronoId} | Date: {moment(incident.date).format('DD MMMM YYYY')}
			</p>
			<hr class="my-3" />
			<h3 class="mb-1 text-lg font-bold">{incident.title}</h3>
			<h5 class="mb-2 text-sm font-semibold text-gray-600">
				{incident.killedOrWounded} killed/wounded
			</h5>
			{#if incident.videoUrl}
				<video
					class="aspect-video video relative mt-2 w-full rounded-lg"
					src={incident.videoUrl}
					controls
					aria-label={incident.videoCaption || incident.title}
				></video>
			{:else if incident.imageUrl}
				<img
					class="aspect-video video relative mt-2 w-full rounded-lg"
					src={incident.imageUrl}
					alt={incident.imageCaption || incident.title}
				/>
			{/if}
			{#if incident.description && incident.description.includes('<')}
				<div class="text-sm text-gray-700">{@html incident.description}</div>
			{:else}
				<p class="text-sm text-gray-700">{incident.description}</p>
			{/if}
			{#if incident.videoCaption}
				<p class="pt-1 text-sm text-zinc-500">{incident.videoCaption}</p>
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
	.video {
		aspect-ratio: 16/9;
	}
</style>

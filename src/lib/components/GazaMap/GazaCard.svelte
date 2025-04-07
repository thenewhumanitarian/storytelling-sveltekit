<script>
	import moment from 'moment';
	let { incident, selectedMarkerId } = $props();
</script>

<div
	class="stack-cards__item js-stack-cards__item mx-4 my-4 border bg-white p-4"
	data-id={incident.chronoId}
>
	<div
		class="bg-white"
		class:opacity-100={incident.chronoId === selectedMarkerId}
		class:opacity-30={incident.chronoId !== selectedMarkerId}
	>
		<p class="font-mono text-sm text-zinc-500">
			﹟ ID: {incident.id} | ⏱ ChronoID: {incident.chronoId} | Date: {moment(incident.date).format(
				'DD MMMM YYYY'
			)}
		</p>
		<hr class="my-3" />
		<h3 class="mb-1 text-lg font-bold">{incident.title}</h3>
		<h5 class="mb-2 text-sm font-semibold text-gray-600">
			{incident.killedOrWounded} killed/wounded
		</h5>
		{#if incident.description && incident.description.includes('<')}
			<div class="text-sm text-gray-700">
				{@html incident.description}
			</div>
		{:else}
			<p class="text-sm text-gray-700">{incident.description}</p>
		{/if}
		<!-- Video element (optional) -->
		{#if incident.videoUrl && incident.videoUrl.includes('youtube.com')}
			{@const videoId = incident.videoUrl.split('v=')[1]?.split('&')[0]}
			{#if videoId}
				<iframe
					class="aspect-video video relative mt-2 w-full rounded-lg"
					src={`https://www.youtube.com/embed/${videoId}`}
					title={incident.videoCaption || 'Embedded Youtube video'}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			{/if}
		{:else if incident.videoUrl && incident.videoUrl.includes('youtu.be')}
			<!-- Shortened YouTube URL format -->
			{@const videoId = incident.videoUrl.split('/').pop()}
			{#if videoId}
				<iframe
					class="aspect-video video relative mt-2 w-full rounded-lg"
					src={`https://www.youtube.com/embed/${videoId}`}
					title={incident.videoCaption || 'Embedded Youtube video'}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			{/if}
		{/if}
		<!-- To do: Allow for different video streaming platforms here? Include mp4 file videos? -->
		{#if incident.videoCaption}
			<p class="pt-1 text-sm text-zinc-500">{incident.videoCaption}</p>
		{/if}
	</div>
</div>

<style>
	.stack-cards__item {
		/* position: sticky; */
		top: 2.5rem; /* <-- This defines *where* they stick */
		min-height: calc(70vh - 10rem); /* <-- This defines *how tall* each card is */
		min-height: calc(70svh - 10rem); /* <-- This defines *how tall* each card is */
		transform-origin: center top;
		/* box-shadow: 0 0 0 -5px rgba(0, 0, 0, 0.1); */
		transition: transform 0.2s ease;
	}
	.video {
		aspect-ratio: 16/9;
	}
</style>

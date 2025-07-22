<script lang="ts">
	import type { IncidentData } from './types';
	import { fade } from 'svelte/transition';

	export let event: IncidentData | null = null;
</script>

{#if event}
	<div
		class="absolute inset-0 z-40 flex items-center justify-center bg-black/70"
		transition:fade={{ duration: 250 }}
	>
		{#if event.imageUrl}
			<img
				src={event.imageUrl}
				alt=""
				class="pointer-events-none absolute inset-0 z-0 h-full w-full scale-125 select-none object-cover blur-lg"
				aria-hidden="true"
			/>
		{/if}
		<div class="relative z-10 flex h-full w-full items-center justify-center">
			{#if event.videoUrl}
				<video
					class="max-h-full max-w-full shadow-lg"
					src={event.videoUrl}
					controls
					autoplay
					aria-label={event.videoCaption || event.title}
				></video>
			{:else if event.imageUrl}
				<img
					class="max-h-full max-w-full shadow-lg"
					src={event.imageUrl}
					alt={event.imageCaption || event.title}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-gray-300">
					<span class="w-full p-8 text-center font-title text-2xl sm:text-5xl font-bold text-gray-800"
						>{event.title}</span
					>
				</div>
			{/if}
		</div>
	</div>
{/if}

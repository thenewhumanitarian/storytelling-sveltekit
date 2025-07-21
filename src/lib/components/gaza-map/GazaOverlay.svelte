<script lang="ts">
import type { IncidentData } from './types';
import { fade } from 'svelte/transition';

export let event: IncidentData | null = null;
</script>

{#if event}
	<div class="absolute inset-0 z-40 flex items-center justify-center bg-black/70" transition:fade={{ duration: 250 }}>
		{#if event.imageUrl}
			<img
				src={event.imageUrl}
				alt=""
				class="absolute inset-0 w-full h-full object-cover blur-lg scale-125 z-0 pointer-events-none select-none"
				aria-hidden="true"
			/>
		{/if}
		<div class="relative z-10 flex items-center justify-center w-full h-full">
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
				<div class="flex items-center justify-center w-full h-full bg-gray-300">
					<span class="text-4xl font-bold text-gray-800 text-center w-full">{event.title}</span>
				</div>
			{/if}
		</div>
	</div>
{/if} 
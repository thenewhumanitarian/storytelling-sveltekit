<script lang="ts">
	import type { IncidentData } from './types';
	import { fade } from 'svelte/transition';
	import GazaVideo from './GazaVideo.svelte';

	export let event: IncidentData | null = null;
</script>

{#if event}
	<div
		class="absolute inset-0 z-20 flex items-center justify-center bg-black/70"
		transition:fade={{ duration: 250 }}
	>
		{#if event.imageUrl}
			<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
				<img
					src={event.imageUrl}
					alt=""
					class="h-full w-full select-none object-cover blur-lg"
					style="transform: scale(1.1);"
					aria-hidden="true"
				/>
			</div>
		{/if}
		<div class="relative z-10 flex h-full w-full items-center justify-center">
			{#if event.videoUrl}
				<GazaVideo
					videoUrl={event.videoUrl}
					imageUrl={event.imageUrl}
					title={event.title}
					videoCaption={event.videoCaption}
				/>
				{#if event.videoCaption}
					<p
						class="absolute bottom-0 left-0 right-0 m-0 bg-black/60 p-2 text-xs text-white shadow sm:text-sm"
					>
						{event.videoCaption}
					</p>
				{/if}
			{:else if event.imageUrl}
				<img
					class="max-h-full max-w-full shadow-lg"
					src={event.imageUrl}
					alt={event.imageCaption || event.title}
				/>
				{#if event.imageCaption}
					<p
						class="absolute bottom-0 left-0 right-0 m-0 bg-black/60 p-2 text-xs text-white shadow sm:text-sm"
					>
						{event.imageCaption}
					</p>
				{/if}
			{:else}
				<div class="overlay-gradient flex h-full w-full items-center justify-center">
					<div class="absolute inset-0 bg-black/30"></div>
					<span
						class="relative w-full p-8 text-center font-title text-2xl font-bold text-white drop-shadow-lg sm:text-5xl"
						>{event.title}</span
					>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Modern gradient background for overlay */
	.overlay-gradient {
		background: linear-gradient(
			135deg,
			#c4677a 0%,
			#d47284 25%,
			#b85d70 50%,
			#cc6b7e 75%,
			#a55468 100%
		);
		background-size: 200% 200%;
		animation: gradientShift 10s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
</style>

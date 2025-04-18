<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	import ScrapBookPaper from '$lib/components/projects/LebanonDisplaced/ScrapBookPaper.svelte';

	import { isArabic } from '$lib/utils/storyblok'; // Function to detect Storyblok language
	let isRtl = $derived(isArabic());
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	style={`
      position: absolute;
      right: ${isRtl ? 'unset' : `${blok.posX}%`};
			left: ${isRtl ? `${blok.posX}%` : 'unset'};
      width: ${blok.width || 'auto'}%;
			aspect-ratio: ${blok.aspectRatio || 'auto'};
      bottom: calc(${blok.posY}%);
			max-height: ${blok.maxHeight ? `${blok.maxHeight}svh` : 'unset'};
    `}
	class={'animation-object'}
>
	<div class="relative h-full w-full">
		<ScrapBookPaper>
			<div class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-full w-full flex items-center justify-center">
				{#if blok.backgroundImage}
					<div
						class="absolute top-0 left-0 w-full h-full"
						style="z-index: -1; opacity: 0.5;"
					></div>
				{/if}
				{#if blok.backgroundImage}
					<div
						class="absolute top-0 left-0 w-full h-full"
						style="z-index: -1; opacity: 0.5;"
					></div>
				{/if}
				{#if blok.backgroundImage}
					<img
						src={`${blok.backgroundImage.filename}/m/400x0/filters:quality(60)`}
						alt={blok.backgroundImage.alt}
						style="object-fit: cover; width: 100%; height: 100%;"
					/>
				{/if}
				<img src={blok.image.filename} alt={blok.alt} />
			</div>
		</ScrapBookPaper>
	</div>
</div>

<style>
	.animation-object {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.animation-object img {
		object-fit: contain;
		/* position: absolute; */
		width: auto;
		max-width: 80%;
		max-height: 80%;
		padding-bottom: 10%;
	}
</style>

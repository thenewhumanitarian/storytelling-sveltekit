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
	<ScrapBookPaper>
		<div class="absolute left-0 top-0 flex h-full w-full items-center justify-center">
			{#if blok.backgroundImage}
				<img
					src={`${blok.backgroundImage.filename}/m/400x0`}
					alt={blok.backgroundImage.alt}
					style="object-fit: cover; width: 100%; height: 100%;"
				/>
			{/if}
			<img src={blok.image.filename} alt={blok.alt} />
		</div></ScrapBookPaper
	>
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
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>

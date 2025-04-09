<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	import { isArabic } from '$lib/utils/storyblok'; // Function to detect Storyblok language
	let isRtl = $derived(isArabic());

	const { blok } = $props();
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	style={`
      position: absolute;
      left: ${isArabic() ? 'unset' : `${blok.posX}%`};
			right: ${isArabic() ? `${blok.posX}%` : 'unset'};
      width: ${blok.width || 'auto'}%;
			aspect-ratio: ${blok.aspectRatio || 'auto'};
      bottom: calc(${blok.posY}%);
    `}
	class={'animation-object'}
>
	<img src={blok.image.filename} alt={blok.alt} />
</div>

<style>
	.animation-object {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* border: 1px dashed red; */
	}

	.animation-object img {
		object-fit: contain;
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>

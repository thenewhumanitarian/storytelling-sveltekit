<script>
	import { storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();

	console.log(blok);
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	style={`
      position: absolute;
      top: calc(${blok.posY}% - 6rem);
      left: ${blok.posX}%;
      width: ${blok.width || 'auto'}%;
      height: ${blok.height || 'auto'}%;
    `}
	class={'animation-object'}
>
	<img src={blok.image.filename} alt={blok.alt} />
</div>

<style>
	.animation-object {
    position: relative;
		border: 1px dashed red;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.animation-object img {
		object-fit: contain;
    width: 100%;
    height: 100%;
    position: absolute
	}
</style>

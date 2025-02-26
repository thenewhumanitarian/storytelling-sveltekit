<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		blok: any; // Change type later?
		i: number;
	}

	let { blok = {}, i = 0 }: Props = $props();

	console.log(blok);
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`story-grid--panel panel-${i + 1}`}
	style={`
    background-image: url(${blok.image?.filename});
    box-shadow: ${blok.borderColor ? `0 0px 0px 5px ${blok.borderColor}` : 'none'};
    grid-column: span ${blok.colSpan || 1};
  `}
>
	{#if blok.text}
		<FadeIn
			yOffset={50}
			containerClasses={'flex flex-col items-center gap-y-4 px-5 py-3'}
			delay={60 * i + 100}
		>
			<p style={`text-align: ${blok.textAlign || 'left'}; width: 100%;`}>{blok.text}</p>
		</FadeIn>
	{/if}
</div>

<!-- <style>
	@media only screen and (min-width: 400px) {
		.panel-3,
		.panel-6,
		.panel-7 {
			grid-column: span 2;
		}
		.panel-7 {
			text-align: center;
		}
	}
	@media only screen and (min-width: 600px) {
		.panel-3,
		.panel-6 {
			grid-column: auto;
		}
		.panel-8 {
			grid-column: span 2;
		}
	}
</style> -->

<style>
	.story-grid--panel {
		background-size: contain;
		background-position: center center;
	}
</style>

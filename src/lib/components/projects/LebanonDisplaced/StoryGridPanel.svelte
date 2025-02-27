<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		blok: any; // Todo: Define type here
		i: number;
	}

	let { blok = {}, i = 0 }: Props = $props();

	console.log(blok);
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`story-grid--panel panel-${i + 1} ${blok.image && blok.image?.filename ? 'has-image' : ''}`}
	style={`
    box-shadow: ${blok.borderColor ? `0 0px 0px 5px ${blok.borderColor}` : 'none'};
		--colSpan: span ${blok.colSpan || '1'};
  `}
>
	<!-- Todo: Make this a component? -->
	{#if blok.image && blok.image?.filename}
		<FadeIn yOffset={20} delay={10 * i + 100} blurAmount={20}>
			<div
				style={`background-image: url(${blok.image.filename}/m/50x0);`}
				class="h-full w-full bg-contain bg-center bg-no-repeat"
			>
				<img src={`${blok.image.filename}/m/`} alt={blok.image.alt || 'Image'} />
			</div>
		</FadeIn>
	{/if}
	{#if blok.text}
		<FadeIn
			yOffset={50}
			containerClasses={'flex flex-col items-center gap-y-4 px-5 py-3'}
			delay={30 * i + 100}
		>
			<p style={`text-align: ${blok.textAlign || 'left'}; width: 100%;`}>{blok.text}</p>
		</FadeIn>
	{/if}
</div>

<style>
	.story-grid--panel {
		background-size: contain;
		background-position: center center;
		grid-column: var(--colSpan);
	}

	.story-grid--panel.has-image {
		padding: 1rem;
	}

	@media screen and (max-width: 640px) {
		.story-grid--panel {
			grid-column: span 1;
			margin: 0 3rem;
		}

		.story-grid--panel.has-image {
			aspect-ratio: 1/1;
		}
	}
	.story-grid--panel img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>

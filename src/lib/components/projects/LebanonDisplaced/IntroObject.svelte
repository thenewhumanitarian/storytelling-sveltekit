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
			<div
				class="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center"
			>
				{#if blok.backgroundImage}
					<div class="absolute left-0 top-0 h-full w-full" style="z-index: -1; opacity: 0.5;"></div>
				{/if}
				{#if blok.backgroundImage}
					<div class="absolute left-0 top-0 h-full w-full" style="z-index: -1; opacity: 0.5;"></div>
				{/if}
				{#if blok.backgroundImage}
					<img
						src={`${blok.backgroundImage.filename}/m/800x0/filters:quality(80)`}
						alt={blok.backgroundImage.alt}
						style="object-fit: cover; width: 100%; height: 100%;"
					/>
				{/if}
				<img src={blok.image.filename} alt={blok.alt} />
				<!-- Scotch tape pieces -->
				<span class="tape tape-tl"></span>
				<span class="tape tape-tr"></span>
				<span class="tape tape-bl"></span>
				<span class="tape tape-br"></span>
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
		/* padding-bottom: 10%; */
	}

	/* Scotch tape corner pieces */
	:root {
		--tape-color: #dbd8be;
		--tape-opacity: 0.6;
		--tape-size: 45px;
		--tape-width: 65px;
		--tape-height: 35px;
	}
	.tape {
		position: absolute;
		width: var(--tape-width);
		height: var(--tape-height);
		background: var(--tape-color);
		opacity: var(--tape-opacity);
		pointer-events: none;
		will-change: opacity;
		transition: opacity 0.4s;
	}

	/* Corners */
	.tape-tl {
		top: calc(var(--tape-height) * -0.25);
		left: calc(var(--tape-width) * -0.35);
		transform: rotate(-45deg);
	}

	.tape-tr {
		top: calc(var(--tape-height) * -0.25);
		right: calc(var(--tape-width) * 0);
		transform: rotate(45deg);
	}

	.tape-bl {
		bottom: calc(var(--tape-width) * -0.15);
		left: calc(var(--tape-width) * -0.35);
		transform: rotate(45deg);
	}

	.tape-br {
		bottom: calc(var(--tape-width) * -0.15);
		right: calc(var(--tape-width) * -0.35);
		transform: rotate(-45deg);
	}
</style>

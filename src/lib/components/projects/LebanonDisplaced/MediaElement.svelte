<script lang="ts">
	import { onMount } from 'svelte';

	import { storyblokEditable } from '@storyblok/svelte';
	import { openLightbox } from '$lib/stores/lightbox';

	interface Props {
		blok: any;
	}

	let { blok = {} }: Props = $props();
	let element: HTMLElement;

	// Extract width/height from Storyblok filename (e.g. ".../5712x4284/...")
	const match = blok.media?.filename?.match(/\/(\d+)x(\d+)\//);
	const width = match ? parseInt(match[1], 10) : undefined;
	const height = match ? parseInt(match[2], 10) : undefined;
	const type = blok.media?.filename?.toLowerCase().includes('.mp4') ? 'video' : 'image';

	onMount(() => {
		if (blok.pictureFrame && element) {
			const tapeElements = element.querySelectorAll('.tape');

			tapeElements.forEach((el) => {
				const randomDeg = Math.random() * 180 - 90; // Random angle between -90 and 90 degrees
				el.style.transform += ` rotate(${randomDeg.toFixed(2)}deg)`;
			});
		}
	});
</script>

<button
	class={`media-element ${blok.pictureFrame ? 'picture-frame' : ''} ${blok.lightbox ? 'lightbox' : 'no-lightbox'}`}
	bind:this={element}
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	onclick={() => openLightbox(blok.media?.filename.toString())}
	data-lightbox
	data-lightbox-src={blok.media?.filename}
	data-lightbox-type={type}
	data-lightbox-caption={blok.caption || ''}
	data-lightbox-alt={blok.media?.alt || 'Alt text for thiw photo is missing. Apologies.'}
	data-lightbox-width={width}
	data-lightbox-height={height}
>
	<div class={`media-wrapper ${blok.pictureFrame ? 'picture-frame' : ''}`}>
		{#if type === 'video'}
			<video src={blok.media.filename} autoplay loop muted playsinline />
		{:else if blok.media?.filename}
			<img
				src={`${blok.media.filename}/m/240x0/filters:format(webp):quality(80)`}
				alt={blok.media.alt || 'Photo alt text is missing.'}
			/>
		{/if}

		{#if blok.tape?.includes('tl')}
			<span class={`tape tape-tl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
		{#if blok.tape?.includes('tr')}
			<span class={`tape tape-tr ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
		{#if blok.tape?.includes('bl')}
			<span class={`tape tape-bl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
		{#if blok.tape?.includes('br')}
			<span class={`tape tape-br ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
		{#if blok.tape?.includes('tc')}
			<span class={`tape tape-tc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
		{#if blok.tape?.includes('bc')}
			<span class={`tape tape-bc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
		{/if}
	</div>
</button>

<style>
	:root {
		--tape-color: #dbd8be;
		--tape-opacity: 0.6;
		--tape-size: 35px;
		--tape-width: 50px;
		--tape-height: 25px;
	}

	.media-element {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
		transform-origin: center center;
	}

	.media-element:not(.no-lightbox) .media-wrapper {
		border: 0.5px solid transparent;
	}

	.media-element:not(.no-lightbox):hover .media-wrapper {
		border: 0.5px solid #282828;
	}

	.media-wrapper {
		position: relative;
		background: #ffe0b5;
		padding: 0.5rem;
		width: 100%;
		max-width: 200px;
		height: auto;
		display: inline-block;
		overflow: visible;
		box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
	}

	.media-wrapper.picture-frame,
	.media-wrapper.picture-frame-landscape {
		padding: 0.75rem;
	}

	@media screen and (max-width: 640px) {
		.media-wrapper.picture-frame,
		.media-wrapper.picture-frame-landscape {
			box-shadow: none;
			padding: 1rem;
		}
	}

	.media-wrapper img,
	.media-wrapper video {
		width: 100%;
		height: auto;
		object-fit: contain;
		display: block;
		border: none;
	}

	/* Scotch tape corner pieces */
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
		right: calc(var(--tape-width) * -0.35);
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

	.tape-tc {
		top: calc(var(--tape-height) * -0.8);
		left: calc(50% - (var(--tape-width) / 2));
	}

	.tape-bc {
		bottom: calc(var(--tape-width) * -0.35);
		left: calc(50% - (var(--tape-width) / 2));
	}

	.tape-br.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--br.png');
		aspect-ratio: 538/303;
		opacity: 1;
		background-size: cover;
	}

	.tape-tr.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tr.png');
		aspect-ratio: 421/458;
		opacity: 1;
		background-size: cover;
		top: calc(var(--tape-height) * -0.4);
		right: calc(var(--tape-width) * -0.35);
	}

	.tape-tl.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tl.png');
		aspect-ratio: 502/250;
		opacity: 1;
		background-size: cover;
		transform: rotate(-15deg);
		top: calc(var(--tape-height) * -0.5);
		/* right: calc(var(--tape-width) * -0.15); */
	}

	.tape-bl.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--bl.png');
		aspect-ratio: 757/248;
		opacity: 1;
		background-size: cover;
		transform: rotate(3deg);
	}

	.tape-tc.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tl.png');
		aspect-ratio: 502/250;
		opacity: 1;
		background-size: cover;
		transform: rotate(-1deg);
	}
	.tape-bc.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tl.png');
		aspect-ratio: 502/250;
		opacity: 1;
		background-size: cover;
		transform: rotate(-2deg) scaleX(-1);
	}
</style>

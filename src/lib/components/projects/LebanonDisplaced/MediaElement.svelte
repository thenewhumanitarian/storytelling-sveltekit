<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { openLightbox } from '$lib/stores/lightbox';

	// const maxWidth = 400;

	interface Props {
		blok: any;
	}

	let { blok = {} }: Props = $props();
	let element: HTMLElement;

	// Extract width/height from Storyblok filename (e.g. ".../5712x4284/...")
	const match = blok.media?.filename?.match(/\/(\d+)x(\d+)\//);
	const width = match ? parseInt(match[1], 10) : undefined;
	const height = match ? parseInt(match[2], 10) : undefined;
	const type = blok.media?.filename?.includes('.mp4') ? 'video' : 'image';
</script>

<button
	class="media-element"
	bind:this={element}
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	onclick={() => openLightbox(blok.media?.filename.toString())}
	data-lightbox-src={blok.media?.filename}
	data-lightbox
	data-lightbox-type={type}
	data-lightbox-caption={blok.caption || ''}
	data-lightbox-alt={blok.media?.alt || 'Alt text for thiw photo is missing. Apologies.'}
	data-lightbox-width={width}
	data-lightbox-height={height}
>
	<div class="media-wrapper">
		{#if type === 'video'}
			<video src={blok.media.filename} autoplay loop muted playsinline />
		{:else}
			<img
				src={`${blok.media.filename}/m/240x0/filters:format(webp):quality(80)`}
				alt={blok.media.alt || 'Photo alt text is missing.'}
			/>
		{/if}

		{#if blok.tape?.includes('tl')}
			<span class="tape tape-tl"></span>
		{/if}
		{#if blok.tape?.includes('tr')}
			<span class="tape tape-tr"></span>
		{/if}
		{#if blok.tape?.includes('bl')}
			<span class="tape tape-bl"></span>
		{/if}
		{#if blok.tape?.includes('br')}
			<span class="tape tape-br"></span>
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
		overflow: visible; /* ✅ This is missing */
		transform-origin: center center;
	}

	.media-element .media-wrapper {
		border: 0.5px solid transparent;
	}

	.media-element:hover .media-wrapper {
		border: 0.5px solid #282828;
	}

	.media-wrapper {
		position: relative;
		background: #ffe0b5;
		padding: 0.5rem;
		box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
		width: 175px;
		height: auto;
		display: inline-block;
		overflow: visible; /* 👈 Add this! */
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
</style>

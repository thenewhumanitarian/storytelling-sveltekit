<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte';

	import { registerMediaElement, setIndexFromSrc } from '$lib/stores/lightbox';

	interface Props {
		blok: any; // TODO: Define type if you want
	}

	let { blok = {} }: Props = $props();

	let element: HTMLElement;

	onMount(() => {
		if (blok?.media?.filename) {
			registerMediaElement({
				src: blok.media.filename,
				type: blok.media.filename.includes('.mp4') ? 'video' : 'image',
				caption: blok.caption || '',
				element
			});
		}
	});

	function openLightbox() {
		if (document.body.classList.contains('is-storyblok-editor')) return;
		setIndexFromSrc(blok.media.filename);
	}
</script>

<button
	class="media-element"
	bind:this={element}
	onclick={openLightbox}
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<div class="media-wrapper">
		{#if blok.media?.filename.includes('.mp4')}
			<video src={blok.media.filename} autoplay loop muted playsinline />
		{:else}
			<img src={blok.media.filename} alt={blok.media.alt} />
		{/if}

		<!-- Scotch tape corners -->
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

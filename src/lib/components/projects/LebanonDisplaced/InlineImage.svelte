<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte';
	import { registerMediaElement, setIndexFromSrc } from '$lib/stores/lightbox';

	const { blok } = $props();

	let alignClass = 'align-center';
	if (blok.align === 'left') {
		alignClass = 'align-left';
	} else if (blok.align === 'right') {
		alignClass = 'align-right';
	}

	let figureEl: HTMLElement;

	function openLightbox() {
		if (document.body.classList.contains('is-storyblok-editor')) return;
		setIndexFromSrc(blok.media.filename);
	}

	onMount(() => {
		if (blok?.media?.filename && figureEl) {
			registerMediaElement({
				src: blok.media.filename,
				type: 'image',
				caption: blok.caption || '',
				element: figureEl
			});
		}
	});
</script>

<div class="inline-image-wrapper" use:storyblokEditable={blok}>
	{#if blok?.media?.filename}
		<figure
			bind:this={figureEl}
			on:click={openLightbox}
			class={`relative cursor-pointer ${alignClass} ${blok.bgColor} ${blok.bgColor === 'bg-transparent' ? '' : 'my-3 p-3'}`}
		>
			<!-- Scotch tape pieces -->
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

			<img src={blok.media.filename} alt={blok.media.alt} />
			{#if blok.caption}
				<figcaption>{blok.caption}</figcaption>
			{/if}
		</figure>
	{/if}
</div>

<style>
	.inline-image-wrapper {
		clear: both;
	}

	figure {
		display: flex;
		flex-direction: column;
		will-change: transform;
		transition: transform 1s;
	}

	.inline-image-wrapper:hover figure {
		transform: rotate(-0deg);
	}

	.inline-image-wrapper:hover figure:not(.bg-transparent) {
		border: 0.5px solid #282828;
	}

	.inline-image-wrapper:hover figure.bg-transparent img {
		border: 0.5px solid #282828;
	}

	figure:not(.bg-transparent) {
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	figure.bg-transparent img {
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	figcaption {
		margin: 0.25rem 0;
		color: #282828;
		padding: 0;
	}

	.align-left {
		float: left;
		width: 50%;
		margin-left: -25%;
		margin-right: 4%;
		transform: rotate(-3deg);
	}

	.align-left figcaption {
		text-align: right;
	}

	.align-right {
		float: right;
		width: 50%;
		margin-right: -25%;
		margin-left: 4%;
		transform: rotate(3deg);
	}

	.align-center {
		margin: 2rem auto;
		width: 100%;
	}

	@media screen and (max-width: 945px) {
		.inline-image-wrapper {
			margin: 1rem auto;
		}
		.align-left,
		.align-right,
		.align-center {
			float: none;
			margin: 2rem auto;
			width: 100%;
			max-width: 100%;
		}
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

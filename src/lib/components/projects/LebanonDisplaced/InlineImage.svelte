<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte';
	import { registerMediaElement, setIndexFromSrc } from '$lib/stores/lightbox';
	import ScrapBookPaper from '$lib/components/projects/LebanonDisplaced/ScrapBookPaper.svelte';

	const { blok } = $props();

	let alignClass = $state('align-center');
	if (blok.align === 'left') {
		alignClass = 'align-left';
	} else if (blok.align === 'right') {
		alignClass = 'align-right';
	}

	let figureEl: HTMLElement;

	function openLightbox() {
		if (!blok.lightbox) return;
		if (document.body.classList.contains('is-storyblok-editor')) return;
		setIndexFromSrc(blok.media.filename);
	}

	function escapeHTML(str: string) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	onMount(() => {
		if (blok?.media?.filename && figureEl) {
			if (!blok.lightbox) return;
			registerMediaElement({
				src: blok.media.filename,
				type: 'image',
				caption: escapeHTML(blok.caption || ''),
				element: figureEl
			});
		}
	});
</script>

<div class="inline-image-wrapper" use:storyblokEditable={blok}>
	{#if blok?.media?.filename}
		<figure
			bind:this={figureEl}
			class={`relative cursor-pointer ${alignClass} ${blok.marginY ? '' : 'no-margin-y'} ${blok.bgColor} ${blok.bgColor === 'bg-transparent' ? '' : 'my-3 p-3'}`}
			style={`--rotation-angle: ${blok.rotation || 0}deg`}
		>
			<button
				type="button"
				class={`relative flex h-full w-full items-center justify-center`}
				onclick={openLightbox}
				aria-label={blok.lightbox ? 'Open lightbox' : 'Image'}
			>
				{#if blok.bgColor === 'bg-scrap-paper'}
					<ScrapBookPaper mouseOver={false} maxWidthMobile={'150px'}>
						<div class="h-full w-full p-10">
							<img
								class="inline-image"
								src={`${blok.media.filename}/m/480x0`}
								alt={blok.media.alt || 'Photo alt text is missing.'}
							/>
						</div>
					</ScrapBookPaper>
				{:else}
					<img
						class="inline-image"
						src={`${blok.media.filename}/m/480x0`}
						alt={blok.media.alt || 'Photo alt text is missing.'}
					/>
				{/if}
				{#if blok.bgColor === 'bg-transparent'}
					{#if blok.tape?.includes('tr')}
						<span class="tape tape-tl"></span>
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
				{/if}
			</button>

			{#if blok.caption}
				<figcaption>{blok.caption}</figcaption>
			{/if}

			{#if blok.tape && blok.bgColor !== 'bg-transparent' && blok.bgColor !== 'bg-scrap-paper'}
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
		transition: transform 0.8s;
		border: 0.5px solid transparent;
	}

	.inline-image-wrapper:hover figure {
		transform: rotate(-0deg);
	}

	.inline-image-wrapper:hover figure:not(.bg-transparent, .bg-scrap-paper) {
		border: 0.5px solid #282828;
	}

	.inline-image-wrapper:hover figure.bg-scrap-paper {
		border: 0.5px solid transparent !important;
	}

	.inline-image-wrapper:hover figure.bg-transparent img {
		border: 0.5px solid #282828;
	}
	figure:not(.bg-transparent, .bg-scrap-paper) {
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
		transform: rotate(var(--rotation-angle, 0deg));
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.align-left figcaption {
		text-align: right;
	}

	:global(.arabic .align-left figcaption) {
		text-align: right;
	}

	:global(.arabic .align-right figcaption) {
		text-align: left;
	}

	.align-right {
		float: right;
		width: 50%;
		margin-right: -25%;
		margin-left: 4%;
		transform: rotate(var(--rotation-angle, 0deg));
	}

	.align-right:not(.no-margin-y) {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.align-center {
		margin: 2rem auto;
		width: 100%;
	}

	@media screen and (max-width: 1200px) {
		.align-left {
			margin-left: -15%;
		}

		.align-right {
			margin-right: -15%;
		}

		.align-left,
		.align-right {
			width: 50%;
		}
	}

	@media screen and (max-width: 925px) {
		.inline-image-wrapper {
			margin: 2.5rem auto;
		}

		.align-left,
		.align-right,
		.align-center {
			float: none;
			margin: 3rem auto;
			width: 100%;
			max-width: 400px;
		}

		.align-left figcaption,
		.align-right figcaption {
			text-align: center;
		}

		.align-left.no-margin-y,
		.align-right.no-margin-y,
		.align-center.no-margin-y {
			margin: 0 auto;
		}
	}

	@media screen and (max-width: 640px) {
		.align-left,
		.align-right,
		.align-center {
			max-width: 280px;
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

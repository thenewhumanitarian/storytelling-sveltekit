<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { openLightbox } from '$lib/stores/lightbox';
	import ScrapBookPaper from '$lib/components/projects/LebanonDisplaced/ScrapBookPaper.svelte';

	const { blok } = $props();

	let alignClass = $state('align-center');
	if (blok.align === 'left') {
		alignClass = 'align-left';
	} else if (blok.align === 'right') {
		alignClass = 'align-right';
	}

	let figureEl: HTMLElement;

	const match = blok.media?.filename?.match(/\/(\d+)x(\d+)\//);
	const width = match ? parseInt(match[1], 10) : undefined;
	const height = match ? parseInt(match[2], 10) : undefined;

	const isStartPage = blok.bgColor === 'bg-transparent' && blok.lightbox === false;
	const hasLightbox = blok.lightbox === true;
</script>

<div class={`inline-image-wrapper ${hasLightbox ? 'lightbox' : 'no-lightbox'}`}>
	{#if blok?.media?.filename}
		<figure
			bind:this={figureEl}
			class={`relative cursor-pointer ${alignClass} ${blok.marginY ? '' : 'no-margin-y'} ${blok.bgColor} ${hasLightbox ? 'lightbox' : 'no-lightbox'} ${blok.bgColor === 'bg-transparent' ? '' : 'p-2'}`}
			style={`--rotation-angle: ${blok.rotation || 0}deg`}
			use:storyblokEditable={blok}
		>
			<button
				type="button"
				class={`relative flex h-full w-full items-center justify-center ${isStartPage ? 'no-lightbox' : ''}`}
				onclick={() => openLightbox(blok.media?.filename.toString())}
				aria-label={blok.lightbox ? 'Open lightbox' : 'Image'}
				data-lightbox={blok.lightbox ? 'true' : 'false'}
				data-lightbox-src={blok.lightbox ? blok.media?.filename : ''}
				data-lightbox-type="image"
				data-lightbox-caption={blok.caption || ''}
				data-lightbox-alt={blok.media?.alt || 'Alt text for this photo is missing.'}
				data-lightbox-width={width}
				data-lightbox-height={height}
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
						class={`inline-image`}
						src={`${blok.media.filename}/m/480x0`}
						alt={blok.media.alt || 'Photo alt text is missing.'}
					/>
				{/if}
				{#if blok.bgColor === 'bg-transparent'}
					{#if blok.tape?.includes('tl')}
						<span class={`tape tape-tl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
					{#if blok.tape?.includes('tr')}
						<span class={`tape tape-tr ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
					{#if blok.tape?.includes('tc')}
						<span class={`tape tape-tc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
					{#if blok.tape?.includes('bl')}
						<span class={`tape tape-bl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
					{#if blok.tape?.includes('br')}
						<span class={`tape tape-br ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
					{#if blok.tape?.includes('bc')}
						<span class={`tape tape-bc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
					{/if}
				{/if}
			</button>

			{#if blok.caption}
				<figcaption class={`font-amman`}>{blok.caption}</figcaption>
			{/if}

			{#if blok.tape && blok.bgColor !== 'bg-transparent' && blok.bgColor !== 'bg-scrap-paper'}
				{#if blok.tape?.includes('tl')}
					<span class={`tape tape-tl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
				{/if}
				{#if blok.tape?.includes('tr')}
					<span class={`tape tape-tr ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
				{/if}
				{#if blok.tape?.includes('tc')}
					<span class={`tape tape-tc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
				{/if}
				{#if blok.tape?.includes('bl')}
					<span class={`tape tape-bl ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
				{/if}
				{#if blok.tape?.includes('br')}
					<span class={`tape tape-br ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
				{/if}
				{#if blok.tape?.includes('bc')}
					<span class={`tape tape-bc ${blok.pictureFrame ? 'picture-frame' : ''}`}></span>
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

	.inline-image-wrapper:hover figure.bg-scrap-paper {
		border: 0.5px solid transparent !important;
	}

	figure:not(.bg-transparent, .bg-scrap-paper) {
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	figcaption {
		margin: 0.25rem 0;
		color: #282828;
		padding: 0;
	}

	.align-left,
	.align-right,
	.align-center {
		float: none;
		margin: 3rem auto;
		width: 100%;
		max-width: 420px;
		transform: rotate(var(--rotation-angle, 0deg));
	}

	:global(.content-wrapper .align-left) {
		float: left;
		margin-left: -18%;
		width: 50%;
		transform: rotate(var(--rotation-angle, 0deg));
		margin-bottom: 1rem;
		margin-top: 1rem;
		margin-right: 4%;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	:global(.content-wrapper .align-right) {
		float: right;
		width: 50%;
		transform: rotate(var(--rotation-angle, 0deg));
		margin-right: -18%;
		margin-left: 4%;
		margin-bottom: 1rem;
		margin-top: 1rem;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	.align-right.no-lightbox,
	.align-left.no-lightbox {
		width: 40%;
		box-shadow: none;
	}

	:global(.align-left figcaption) {
		text-align: left;
	}

	:global(.arabic .align-left figcaption) {
		text-align: right;
	}

	:global(.arabic .align-right figcaption) {
		text-align: left;
	}

	:global(.align-right:not(.no-margin-y), .align-left:not(.no-margin-y)) {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.align-center {
		margin: 2rem auto;
		width: 100%;
	}

	:global(figcaption) {
		text-align: left;
	}

	:global(.arabic figcaption) {
		text-align: right !important;
	}

	@media screen and (max-width: 1200px) {
		.align-left,
		.align-right {
			width: 48%;
		}

		.align-left.no-lightbox,
		.align-right.no-lightbox {
			width: 38%;
		}

		:global(.content-wrapper .align-left) {
			margin-left: -15%;
		}

		:global(.content-wrapper .align-right) {
			margin-right: -15%;
		}
	}

	@media screen and (max-width: 825px) {
		.inline-image-wrapper {
			margin: 2.5rem auto;
		}
		.inline-image-wrapper.no-lightbox {
			margin: -1rem auto 0 auto;
		}
		.align-left,
		.align-right,
		.align-center {
			float: none;
			margin: 3rem auto;
			width: 100%;
			max-width: 360px;
			transform: rotate(0deg);
		}

		.align-left.no-margin-y,
		.align-right.no-margin-y,
		.align-center.no-margin-y {
			margin: 0 auto;
		}

		.align-left.no-lightbox,
		.align-right.no-lightbox {
			width: 100%;
			max-width: 360px;
			margin: 1rem auto;
		}
	}

	@media screen and (max-width: 640px) {
		.align-left,
		.align-right,
		.align-center {
			max-width: 240px;
		}

		.align-left.no-lightbox,
		.align-right.no-lightbox {
			width: 100%;
			max-width: 320px;
			margin: 1rem auto;
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
	.tape-tc {
		top: calc(var(--tape-height) * -0.5);
		left: calc(50% - (var(--tape-width) / 2));
	}
	.tape-bc {
		bottom: calc(var(--tape-width) * -0.25);
		left: calc(50% - (var(--tape-width) / 2));
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

	/* Picture Frame */
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
		top: calc(var(--tape-height) * -0.5);
	}
	.tape-tl.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tl.png');
		aspect-ratio: 502/250;
		opacity: 1;
		background-size: cover;
		transform: rotate(-15deg);
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
		transform: rotate(-2deg);
	}
	.tape-bc.picture-frame {
		background: url('/assets/ldd/frames/picture-frame--tape--tl.png');
		aspect-ratio: 502/250;
		opacity: 1;
		background-size: cover;
		transform: rotate(-7deg) scaleX(-1);
	}
</style>

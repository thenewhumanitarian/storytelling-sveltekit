<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	const { blok, singleObject } = $props();
	import { PUBLIC_BASE_URL } from '$env/static/public';

	import ScrapBookPaper from '$lib/components/projects/LebanonDisplaced/ScrapBookPaper.svelte';

	import { isArabic } from '$lib/utils/storyblok'; // Function to detect Storyblok language
	let isRtl = $derived(isArabic());

	let baseUrl = PUBLIC_BASE_URL || 'https://localhost:5173';
</script>

<div
	style={`
      position: absolute;
      right: ${isRtl ? 'unset' : `${blok.posX}%`};
			left: ${isRtl ? `${parseFloat(blok.posX) + 1.25}%` : 'unset'};
			transform: rotate(${isRtl ? `-${blok.rotate}deg` : `${blok.rotate}deg`});
      width: ${blok.width || 'auto'}%;
			aspect-ratio: ${blok.aspectRatio || 'auto'};
      bottom: calc(${blok.posY}%);
			max-height: ${blok.maxHeight ? `${blok.maxHeight}svh` : 'unset'};
    `}
	class={`animation-object hover:z-50 ${singleObject ? 'single' : ''}`}
>
	<div
		class="relative h-full w-full"
		use:storyblokEditable={blok && blok._editable ? blok : undefined}
	>
		{#if blok.link?.id || blok.link?.url}
			<a
				href={`${blok.link ? `${baseUrl}/stories/2025/lebanon-displacement-diaries/${blok.link.cached_url.startsWith('/') ? blok.link.cached_url.slice(1) : blok.link.cached_url}` : '#'}`}
				class="block h-full w-full"
			>
				<ScrapBookPaper>
					<div
						class="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center"
					>
						{#if blok.backgroundImage}
							<div
								class="absolute left-0 top-0 h-full w-full"
								style="z-index: -1; opacity: 0.5;"
							></div>
						{/if}
						{#if blok.backgroundImage}
							<div
								class="absolute left-0 top-0 h-full w-full"
								style="z-index: -1; opacity: 0.5;"
							></div>
						{/if}
						{#if blok.backgroundImage}
							<img
								src={`${blok.backgroundImage.filename}/m/800x0/filters:quality(80)`}
								alt={blok.backgroundImage.alt}
								style="object-fit: cover; width: 100%; height: 100%;"
							/>
						{/if}
						<img src={blok.image.filename} alt={blok.alt} />
					</div>
					<!-- Scotch tape pieces -->
					<span class="tape tape-tl"></span>
					<span class="tape tape-tr"></span>
					<span class="tape tape-bl"></span>
					<span class="tape tape-br"></span>
				</ScrapBookPaper>
			</a>
		{:else}
			<ScrapBookPaper>
				<div
					class="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center"
				>
					{#if blok.backgroundImage}
						<div
							class="absolute left-0 top-0 h-full w-full"
							style="z-index: -1; opacity: 0.5;"
						></div>
					{/if}
					{#if blok.backgroundImage}
						<div
							class="absolute left-0 top-0 h-full w-full"
							style="z-index: -1; opacity: 0.5;"
						></div>
					{/if}
					{#if blok.backgroundImage}
						<img
							src={`${blok.backgroundImage.filename}/m/800x0/filters:quality(80)`}
							alt={blok.backgroundImage.alt}
							style="object-fit: cover; width: 100%; height: 100%;"
						/>
					{/if}
					<img src={blok.image.filename} alt={blok.alt} />
				</div>
				<!-- Scotch tape pieces -->
				<span class="tape tape-tl"></span>
				<span class="tape tape-tr"></span>
				<span class="tape tape-bl"></span>
				<span class="tape tape-br"></span>
			</ScrapBookPaper>
		{/if}
	</div>
</div>

<style>
	.animation-object {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(animation-object:hover) {
		z-index: 999 !important;
	}

	@media screen and (max-width: 850px) {
		:global(.animation-object.single) {
			max-width: calc(100% - 1rem) !important;
			width: auto !important;
			height: 45svh !important;
			bottom: 1rem !important;
			right: 0.5rem !important;
		}
		:global(.arabic .animation-object.single) {
			bottom: 1rem !important;
			left: 1rem !important;
			right: unset !important;
		}
	}

	.animation-object img {
		object-fit: contain;
		width: auto;
		max-width: 80%;
		max-height: 80%;
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
		right: calc(var(--tape-width) * -0.15);
		transform: rotate(45deg);
	}

	.tape-bl {
		bottom: calc(var(--tape-width) * -0.15);
		left: calc(var(--tape-width) * -0.35);
		transform: rotate(45deg);
	}

	.tape-br {
		bottom: calc(var(--tape-width) * -0.15);
		right: calc(var(--tape-width) * -0.15);
		transform: rotate(-45deg);
	}
</style>

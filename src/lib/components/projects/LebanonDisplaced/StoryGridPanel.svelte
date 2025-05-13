<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public';

	interface Props {
		blok: any; // Todo: Define type here
		i: number;
	}

	let { blok = {}, i = 0 }: Props = $props();

	let baseUrl = PUBLIC_BASE_URL || 'https://localhost:5173';

	onMount(async () => {
		if (typeof window !== 'undefined') {
			document.querySelectorAll('.rotate').forEach((el) => {
				const randomAngle = (Math.random() * 16 - 8).toFixed(2); // Random angle between -8 and 8 degrees
				(el as HTMLElement).style.transform = `rotate(${randomAngle}deg)`;
			});
		}
	});

	const hasLink = blok.link?.id || blok.link?.url;

	// console.log(blok.textAlign);
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`
		story-grid--panel group mx-auto hidden rounded-xs items-center justify-center sm:flex ${hasLink ? 'has-link' : ''} panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.bgColor} ${blok.rotate ? 'rotate' : ''} ${blok.isPlaceholder ? 'placeholder' : ''}
	`}
	style={`
		--colSpan: span ${blok.colSpan || '1'};
		--borderColor: ${blok.borderColor || 'transparent'};
  `}
>
	{#if blok.link.id || blok.link.url}
		<a
			href={`${blok.link ? `${baseUrl}/stories/2025/lebanon-displacement-diaries/${blok.link.cached_url.startsWith('/') ? blok.link.cached_url.slice(1) : blok.link.cached_url}` : '#'}`}
			class="font-reset"
			data-sveltekit-reload
			data-sveltekit-preload-data
			data-sveltekit-preload
		>
			{#if blok.items}
				<FadeIn
					yOffset={50}
					containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 ${blok.bgColor === 'note' ? 'sm:py-2 sm:px-1' : 'px-2'}`}
					delay={30 * i + 100}
				>
					<div class={`flex h-full w-full flex-col justify-start gap-y-3 overflow-visible`}>
						{#if blok?.items}
							{#each blok.items as item (item._uid)}
								<StoryblokComponent blok={item} />
							{/each}
						{/if}
					</div>
				</FadeIn>
			{/if}
			<div
				class={`${blok.textAlign === 'left' ? 'right text-right' : 'left'} read-more-tag rounded-xs -z-1 flex items-center justify-end`}
			>
				<h3 class="m-0 bg-lebgreen px-2 py-1 text-white text-base group-hover:underline shadow-lg">Read</h3>
			</div>
		</a>
	{:else}
		<div class="font-reset">
			{#if blok.items}
				<FadeIn
					yOffset={50}
					containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 ${blok.bgColor === 'note' ? 'sm:py-2 sm:px-1' : blok.bgColor === 'picture-frame-landscape' ? 'px-1 py-2' : 'px-2 py-3'}`}
					delay={30 * i + 100}
				>
					<div class={`flex h-full w-full flex-col justify-start gap-y-3 overflow-visible`}>
						{#if blok?.items}
							{#each blok.items as item (item._uid)}
								<StoryblokComponent blok={item} />
							{/each}
						{/if}
					</div>
				</FadeIn>
			{/if}
		</div>
	{/if}
</div>
<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`
		story-grid--panel hover-transit flex sm:hidden panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.bgColor} ${blok.rotate ? 'rotate' : ''} ${blok.isPlaceholder ? 'placeholder' : ''}
	`}
	style={`
		--colSpan: span ${blok.colSpan || '1'};
		--borderColor: ${blok.borderColor || 'transparent'};
  `}
>
	{#if blok.link.id || blok.link.url}
		<a
			href={`${blok.link ? `${baseUrl}/stories/2025/lebanon-displacement-diaries/${blok.link.cached_url.startsWith('/') ? blok.link.cached_url.slice(1) : blok.link.cached_url}` : '#'}`}
			class="font-reset"
		>
			{#if blok.items}
				<div class={`flex h-full w-full flex-col justify-start gap-y-3 overflow-visible`}>
					{#if blok?.items}
						{#each blok.items as item (item._uid)}
							<StoryblokComponent blok={item} />
						{/each}
					{/if}
				</div>
			{/if}
		</a>
	{:else}
		<div class="font-reset">
			{#if blok.items}
				<div class={`flex h-full w-full flex-col justify-start gap-y-3 overflow-visible`}>
					{#if blok?.items}
						{#each blok.items as item (item._uid)}
							<StoryblokComponent blok={item} />
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.story-grid--panel {
		background-size: contain;
		background-position: center center;
		grid-column: var(--colSpan);
		opacity: 1;
		z-index: 0;
		will-change: opacity;
		transition: opacity 0.5s;
	}

	.read-more-tag {
		bottom: 0.5rem;
	}

	.read-more-tag.left {
		right: 0.5rem;
		left: unset;
	}

	.read-more-tag.right {
		left: 0.5rem;
		right: unset;
	}

	@media screen and (max-width: 925px) {
		.read-more-tag {
			bottom: 0;
			top: unset;
		}
		.read-more-tag.right,
		.read-more-tag.left {
			left: 0;
			right: unset;
		}
		:global(.arabic .read-more-tag.right, .arabic .read-more-tag.left) {
			left: unset;
			right: 0;
		}
	}

	@media screen and (max-width: 640px) {
		.stpo .story-grid--panel {
			grid-column: span 1 !important;
		}
	}

	.story-grid--panel:not(
			.note,
			.placeholder,
			.picture-frame,
			.picture-frame-landscape
		) {
		padding: 1rem;
		margin: 0 0.5rem;
		font-size: 1rem;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		border: solid 0.5px var(--borderColor);
	}

	.story-grid--panel:not(.note, .brown-card, .placeholder, .picture-frame) {
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	:global(.story-grid--panel.picture-frame-landscape) {
		/* display: flex; */
		align-items: center;
		justify-content: center;
	}

	.story-grid--panel.note {
		background-image: url('/assets/ldd/patterns/scrapbook-note.png');
		background-size: contain;
		border-color: transparent;
		width: 100%;
	}

	/* Scotch tape effect */
	.story-grid--panel.brown-card {
		background-image: url('/assets/ldd/patterns/paper-texture--landscape.webp');
		background-size: cover;
	}

	.story-grid--panel.picture-frame {
		background-image: url('/assets/ldd/frames/picture-frame--body.png');
		background-size: 100%;
		aspect-ratio: 1842/2276;
		border: none;
		box-shadow: none;
		max-width: 200px;
	}

	.story-grid--panel.picture-frame-landscape {
		background-image: url('/assets/ldd/frames/picture-frame--body--landscape.png');
		background-size: 100%;
		aspect-ratio: 2/1.75;
		border: none;
		box-shadow: none;
		max-width: 200px;
	}

	:global(
		.story-grid--panel.picture-frame .media-wrapper,
		.story-grid--panel.picture-frame-landscape .media-wrapper
	) {
		background: transparent;
	}

	:global(
		.story-grid--panel.picture-frame .media-wrapper img,
		.story-grid--panel.picture-frame .media-wrapper video
	) {
		aspect-ratio: 1583/2013;
		object-fit: cover;
	}

	:global(
		.story-grid--panel.picture-frame-landscape .media-wrapper img,
		.story-grid--panel.picture-frame-landscape .media-wrapper video
	) {
		aspect-ratio: 4/3;
		object-fit: cover;
	}

	:global(.story-grid--panel.picture-frame .media-wrapper) {
		background: transparent;
	}

	.story-grid--panel:hover {
		opacity: 1;
		z-index: 1;
	}

	.story-grid--panel.has-image {
		padding: 1rem;
	}

	@media screen and (max-width: 640px) {
		.story-grid--panel.has-image {
			aspect-ratio: 4/3;
			position: relative;
			max-width: 90%;
			margin: 0 auto;
		}
	}

	:global(.story-grid--panel .storyblok--richtext) {
		word-wrap: break-word;
		hyphens: auto;
	}

	:global(.story-grid--panel.has-image .storyblok--richtext) {
		max-width: 100%;
		padding: 0 0.5rem;
	}

	.story-grid--panel.has-image img {
		width: 100%;
		height: 100%;
	}

	/* Wrapper for floating object */
	.panel-object-wrapper {
		display: inline-block;
		position: relative;
	}

	/* Floating object */
	.story-grid--panel .panel-object {
		pointer-events: none;
		overflow: hidden;
		z-index: 10;
	}

	/* Default floating effect (Simulates previous floating animation) */
	.story-grid--panel .panel-object.float-in-place {
		transform: translateX(0) rotate(0);
		transition: transform 1s ease-in-out;
	}

	/* Fly-out Effects */
	.story-grid--panel.has-image:hover .panel-object.right {
		transform: translateX(-60%) rotate(-10deg);
		transition: transform 1s ease-in-out;
	}

	.story-grid--panel.has-image:hover .panel-object.left {
		transform: translateX(60%) rotate(10deg);
		transition: transform 1s ease-in-out;
	}

	.story-grid--panel.rotate {
		will-change: transform;
		transition: transform 1s ease-in-out;
		transform-origin: center center;
	}

	.story-grid--panel.rotate:hover {
		transform: rotate(0deg) !important;
		opacity: 1;
	}

	.story-grid--panel.has-link {
		transform: translateY(0);
		transition: transform 0.4s ease-in-out;
	}

	/* Base hover effect for panels with links */
	.story-grid--panel.has-link:hover {
		transform: translateY(-2px);
		cursor: pointer;
		will-change: transform, background;
	}

	:global(.story-grid--panel.has-link:hover .inline-image-wrapper figure) {
		transform: rotate(0deg) translateY(2px);
	}
</style>

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
				const randomAngle = (Math.random() * 16 - 8).toFixed(2);
				(el as HTMLElement).style.transform = `rotate(${randomAngle}deg)`;
			});
		}
	});

	const hasLink = blok.link?.id || blok.link?.url;
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`
		story-grid--panel hover-transit group hidden sm:block ${hasLink ? 'has-link' : ''} panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.bgColor} ${blok.rotate ? 'rotate' : ''} ${blok.isPlaceholder ? 'placeholder' : ''}
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
				<FadeIn
					yOffset={50}
					containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 ${blok.bgColor === 'note' ? 'sm:py-2 sm:px-1' : 'px-2 py-3'}`}
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
				class="read-more-tag absolute -right-4 bottom-2 z-50 flex origin-left items-center justify-center"
			>
				<h3 class="m-0 p-0 text-lebgreen group-hover:underline">Read</h3>
			</div>
		</a>
	{:else}
		<div class="font-reset">
			{#if blok.items}
				<FadeIn
					yOffset={50}
					containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 ${blok.bgColor === 'note' ? 'sm:py-2 sm:px-1' : 'px-2 py-3'}`}
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
		story-grid--panel hover-transit block sm:hidden panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.bgColor} ${blok.rotate ? 'rotate' : ''} ${blok.isPlaceholder ? 'placeholder' : ''}
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

	@media screen and (max-width: 640px) {
		.stpo .story-grid--panel {
			grid-column: span 1 !important;
		}
	}

	.story-grid--panel:not(.note, .frame, .placeholder) {
		padding: 1rem;
		margin: 0 0.5rem;
		font-size: 1rem;
		border: solid 0.5px var(--borderColor);
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	.story-grid--panel:not(.note, .frame, .placeholder) {
		/* box-shadow: 0 0 10px 10px hsla(0, 0%, 0%, 0.025); */
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	.story-grid--panel.note {
		background-image: url('/assets/ldd/patterns/scrapbook-note.png');
		background-size: contain;
		border-color: transparent;
		width: 100%;
	}

	/* Read more tag */
	.read-more-tag {
		transform: rotate(0deg);
		transition: transform 0.5s ease-in-out;
		background-image: url('/assets/ldd/patterns/tag--read-more.png');
		background-size: 100%;
		background-repeat: no-repeat;
		aspect-ratio: 241/107;
		height: 2.8rem;
	}

	.story-grid--panel.has-link:hover .read-more-tag {
		transform: rotate(2deg);
	}

	/* Scotch tape effect */
	.story-grid--panel.frame {
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

	img.float-in-place {
		animation: floatEffect 3s ease-in-out infinite;
		animation-delay: random(1s, 3s);
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
		transition: transform 1s;
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
		background: rgba(0, 0, 0, 0.05);
		cursor: pointer;
		will-change: transform, background;
	}

	:global(.story-grid--panel.has-link:hover .inline-image-wrapper figure) {
		transform: rotate(0deg) translateY(2px);
		/* transition-delay: 0.1s; */
	}

	@keyframes floatEffect {
		0% {
			transform: translateY(0px);
			scale: 1;
		}
		50% {
			transform: translateY(-3px);
			scale: 1.015;
		}
		100% {
			scale: 1;
			transform: translateY(0px);
		}
	}
</style>

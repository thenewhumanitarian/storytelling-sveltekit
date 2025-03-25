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
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`
		story-grid--panel hover-transit panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.stretchImage ? 'stretch-image' : ''} ${blok.bgColor} ${blok.rotate ? 'rotate' : ''} ${blok.isPlaceholder ? 'placeholder' : ''}
	`}
	style={`
		--colSpan: span ${blok.colSpan || '1'};
		--borderColor: ${blok.borderColor || 'transparent'};
  `}
>
	<a
		href={`${blok.link ? `${baseUrl}/stories/2025/lebanon-displacement-diaries/${blok.link.cached_url.startsWith('/') ? blok.link.cached_url.slice(1) : blok.link.cached_url}` : '#'}`}
		class="font-reset"
	>
		{#if blok.items}
			<FadeIn
				yOffset={50}
				containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 ${blok.bgColor === 'note' ? 'sm:py-2 sm:px-1' : 'px-2 pt-3 sm:pt-4 pb-3'}`}
				delay={30 * i + 100}
			>
				<div class={`line-clamp-6 flex h-full w-full flex-col justify-between`}>
					{#if blok?.items}
						{#each blok.items as item (item._uid)}
							<StoryblokComponent blok={item} />
						{/each}
					{/if}
				</div>
			</FadeIn>
		{/if}

		<!-- Todo: Make this a component? -->
		{#if blok.image && blok.image?.filename}
			<div
				class={`panel-object absolute top-1/3 sm:top-0 ${blok.textAlign === 'left' ? 'left-1/2' : 'right-1/2'} h-2/3 w-full  bg-cover bg-center bg-no-repeat sm:left-0 sm:h-full ${blok.textAlign} ${blok.floatInPlace ? 'float-in-place' : ''}`}
			>
				<div class={`panel-object--inner`}></div>
				<FadeIn yOffset={20} delay={10 * i + 100} blurAmount={20} isAbsolute={true}>
					<img
						class={`${blok.stretchImage ? 'object-cover' : 'object-contain'} ${blok.floatInPlace ? 'float-in-place' : ''}`}
						src={`${blok.image.filename}/m/`}
						alt={blok.image.alt || 'Image'}
					/>
				</FadeIn>
			</div>
		{/if}
	</a>
</div>

<style>
	.story-grid--panel {
		background-size: contain;
		background-position: center center;
		grid-column: var(--colSpan);
		opacity: 0.9;
		z-index: 0;
	}

	@media screen and (max-width: 640px) {
		.stpo .story-grid--panel {
			grid-column: span 1 !important;
		}
	}

	.story-grid--panel:not(.note, .frame, .placeholder) {
		padding: 0.5rem 0.5rem;
		margin: 0 0.5rem;
		font-size: 1rem;
		border: solid 3px var(--borderColor);
		border-top-left-radius: 255px 15px;
		border-top-right-radius: 15px 225px;
		border-bottom-right-radius: 225px 15px;
		border-bottom-left-radius: 15px 255px;
		will-change: box-shadow;
		transition: box-shadow 0.2s ease-in-out;
	}

	.story-grid--panel:not(.note, .frame, .placeholder):hover {
		box-shadow: 2px 8px 4px -6px hsla(0, 0%, 0%, 0.3);
	}

	.story-grid--panel.note {
		background-image: url('/assets/ldd/patterns/scrapbook-note.png');
		background-size: contain;
		border-color: transparent;
		width: 100%;
	}

	.story-grid--panel.frame {
		background-image: url('/assets/ldd/patterns/picture-frame-one.png');
		background-size: contain;
		border-color: transparent;
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

<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		blok: any; // Todo: Define type here
		i: number;
	}

	let { blok = {}, i = 0 }: Props = $props();
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`story-grid--panel panel-${i + 1} relative ${blok.image && blok.image?.filename ? 'has-image' : ''} ${blok.stretchImage ? 'stretch-image' : ''} ${blok.bgColor || ''}`}
	style={`
    box-shadow: ${blok.borderColor ? `inset 0 0px 0px 5px ${blok.borderColor}` : 'none'};
		--colSpan: span ${blok.colSpan || '1'};
  `}
>
	<a href={`#`} class="font-reset">
		{#if blok.text}
			<FadeIn
				yOffset={50}
				containerClasses={`flex flex-col ${blok.textAlign === 'left' ? 'items-start' : 'items-end'} gap-y-4 py-3 px-4`}
				delay={30 * i + 100}
				isAbsolute={true}
			>
				<div class={`line-clamp-6 w-full sm:w-5/6`}>
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
				class={`panel-object h-full w-full bg-cover bg-center bg-no-repeat ${blok.textAlign} ${blok.floatInPlace ? 'float-in-place' : ''}`}
			>
				<FadeIn yOffset={20} delay={10 * i + 100} blurAmount={20} isAbsolute={true}>
					<img
						class={`${blok.stretchImage ? 'object-cover' : 'object-contain'}`}
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
		transition:
			opacity 0.3s ease-in-out,
			z-index 0.3s ease-in-out;
		z-index: 0;
	}

	.story-grid--panel:hover {
		opacity: 1;
		z-index: 1;
	}

	.story-grid--panel.has-image {
		padding: 1rem;
	}

	.story-grid--panel.has-image img {
		width: 100%;
		height: 100%;
	}

	/* Wrapper for floating object */
	.panel-object-wrapper {
		display: inline-block;
		position: relative;
		transition: transform 0.3s ease-in-out;
	}

	/* Floating object */
	.story-grid--panel .panel-object {
		pointer-events: none;
		overflow: hidden;
		z-index: 10;
		will-change: transform, rotate;
		transition: transform 0.5s ease-in-out;
	}

	/* Default floating effect (Simulates previous floating animation) */
	.story-grid--panel .panel-object.float-in-place {
		transform: translateY(0);
		transition: transform 2s ease-in-out;
	}

	/* Simulate floating effect on hover */
	.story-grid--panel:hover .panel-object.float-in-place {
		transform: translateY(-8px);
	}

	/* Smooth movement and rotation transition */
	.story-grid--panel .panel-object.left,
	.story-grid--panel .panel-object.right {
		transform: translate(0, 0) rotate(0deg);
		transition: transform 0.5s ease-in-out;
	}

	/* Move smoothly on hover */
	.story-grid--panel:hover .panel-object.left {
		transform: translate(50%, 0) rotate(10deg);
	}

	.story-grid--panel:hover .panel-object.right {
		transform: translate(-50%, 0) rotate(-10deg);
	}

	/* Reverse transition when mouse leaves */
	.story-grid--panel .panel-object-wrapper {
		transform: translateY(0);
	}

	/* Fix for stretch-image elements: Slide out instead of scaling */
	.story-grid--panel.stretch-image .panel-object {
		transform: translate(0, 0);
		transition: transform 0.5s ease-in-out;
	}

	/* Slide effect on hover */
	.story-grid--panel.stretch-image:hover .panel-object.left {
		transform: translateX(45%) rotate(10deg);
	}

	.story-grid--panel.stretch-image:hover .panel-object.right {
		transform: translateX(-45%) rotate(-10deg);
	}

	/* Smooth revert effect */
	.story-grid--panel.stretch-image .panel-object.left,
	.story-grid--panel.stretch-image .panel-object.right {
		transform: translateX(0) rotate(0deg);
		transition: transform 0.5s ease-in-out;
	}

	/* Box shadow effect */
	.story-grid--panel.stretch-image:hover .panel-object.left {
		box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.2);
		transition:
			box-shadow 0.3s ease-in-out,
			transform 0.5s ease-in-out;
	}

	.story-grid--panel.stretch-image:hover .panel-object.right {
		box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);
		transition:
			box-shadow 0.3s ease-in-out,
			transform 0.5s ease-in-out;
	}
</style>

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
		transition: opacity 0.25s;
		transition-delay: 100ms;
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

	.story-grid--panel .panel-object {
		transition:
			transform 0.4s ease-in-out,
			rotate 0.4s ease-in-out,
			box-shadow 0.3s ease-in-out;
		transform: translate(0, 0);
		will-change: transform, rotate;
		z-index: 10;
		pointer-events: none;
		overflow: hidden;
	}

	/* Floating effect while in default state */
	.story-grid--panel .panel-object.float-in-place {
		animation: floating-center 6s ease-out infinite;
	}

	/* Move object to the side on hover */
	.story-grid--panel:hover .panel-object.left {
		transform: translate(50%, 0) rotate(10deg);
	}

	.story-grid--panel:hover .panel-object.right {
		transform: translate(-50%, 0) rotate(-10deg);
	}

	/* Ensure smooth return when mouse leaves */
	.story-grid--panel .panel-object {
		transition:
			transform 0.4s ease-in-out,
			rotate 0.4s ease-in-out,
			box-shadow 0.3s ease-in-out;
	}

	/* Add box shadow effect on hover */
	.story-grid--panel.stretch-image:hover .panel-object.left {
		box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.2);
	}

	.story-grid--panel.stretch-image:hover .panel-object.right {
		box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.2);
	}

	/* Add floating effect after movement */
	.story-grid--panel:hover .panel-object.left {
		animation:
			side-move-left 0.2s ease-out forwards,
			floating-left 2s infinite ease-in-out 0.2s;
	}

	.story-grid--panel:hover .panel-object.right {
		animation:
			side-move-right 0.2s ease-out forwards,
			floating-right 2s infinite ease-in-out 0.2s;
	}

	/* Ensure animation resets properly when mouse leaves */
	.story-grid--panel .panel-object {
		animation: none;
	}

	/* Movement animation */
	@keyframes side-move-left {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(50%, 0) rotate(10deg);
		}
	}

	@keyframes side-move-right {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(-50%, 0) rotate(-10deg);
		}
	}

	/* Floating effect */
	@keyframes floating-left {
		0% {
			transform: translate(50%, 0) rotate(10deg) scale(1);
		}
		50% {
			transform: translate(50%, -8px) rotate(9deg) scale(1);
		}
		100% {
			transform: translate(50%, 0) rotate(10deg) scale(1);
		}
	}

	@keyframes floating-right {
		0% {
			transform: translate(-50%, 0) rotate(-10deg) scale(1);
		}
		50% {
			transform: translate(-50%, -8px) rotate(-9deg) scale(1);
		}
		100% {
			transform: translate(-50%, 0) rotate(-10deg) scale(1);
		}
	}

	@keyframes floating-center {
		0% {
			transform: translate(0, 0);
		}
		50% {
			transform: translate(0, -8px);
		}
		100% {
			transform: translate(0, 0);
		}
	}
</style>

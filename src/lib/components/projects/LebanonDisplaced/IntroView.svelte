<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	//@ts-ignore
	import IntroAnimation from '$lib/components/projects/LebanonDisplaced/IntroAnimation.svelte';

	const { blok, className } = $props();
</script>

<div
	use:storyblokEditable={blok}
	class={`intro-view--wrapper z-10 border-b-4 border-lebgreen ${className}`}
	style={`
		height: ${blok.screenHeightInPercent || 100}vh;
		height: ${blok.screenHeightInPercent || 100}svh; /* To do: Mobile should be 100svh always */
		background-image: url("${blok.backgroundImage.filename}/m/800x0/filters:format(webp):quality(50)");
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		background-color: ${blok.backgroundColor};
	`}
>
	<IntroAnimation {blok} />
	<div class="intro-text -z-1">
		<div class="intro-title">
			{#if blok.title.length > 0}
				{#each blok.title as item}
					<StoryblokComponent blok={item} />
				{/each}
			{:else}
				<h1>Lebanon Displacement Diaries</h1>
			{/if}
		</div>
		<div class="intro-credit">
			{#each blok.logos as item}
				<StoryblokComponent blok={item} />
			{/each}
		</div>
	</div>
</div>

<style>
	.intro-view--wrapper {
		position: relative;
		display: flex;
		justify-content: start;
		align-items: center;
		width: 100%;
		height: 100vh;
		padding: 2rem;
		margin-top: -6rem;
		border-bottom: 6px solid inherit;
		z-index: 0;
		background-color: #ffe0b5;
	}

	@media screen and (max-width: 825px) {
		.intro-view--wrapper {
			padding: 0.5rem 1rem 1rem;
			height: 100svh !important;
		}
	}

	.intro-text {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		height: 100%;
		width: 100%;
		max-width: 60%;
		padding-top: 6rem;
	}

	@media screen and (max-width: 800px) {
		.intro-text {
			max-width: 100%;
			padding-top: 6rem;
			justify-content: start;
			/* row-gap: 0.5rem; */
			/* justify-content: flex-start; */
		}
	}

	@media screen and (max-width: 475px) {
		.intro-text {
			padding-top: 5rem;
		}
	}

	.intro-title {
	}

	:global(.arabic .intro-title) {
		left: unset;
		right: 2.5rem;
	}

	.intro-credit {
		/* position: absolute;
		bottom: 3rem;
		left: 2.5rem;
		max-width: 60%; */
	}

	:global(.arabic .intro-credit) {
		/* left: unset;
		right: 2.5rem; */
	}

	@media screen and (max-width: 640px) {
		.intro-title {
			/* top: 5rem;
			left: 1rem;
			text-align: left; */
		}

		:global(.arabic .intro-title) {
			left: unset;
			right: 1rem;
		}

		.intro-credit {
			/* bottom: 1.5rem;
			left: 1rem; */
		}

		:global(.arabic .intro-credit) {
			/* left: unset;
			right: 1rem; */
		}
	}
</style>

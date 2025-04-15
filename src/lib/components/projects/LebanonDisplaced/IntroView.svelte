<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	//@ts-ignore
	import IntroAnimation from '$lib/components/projects/LebanonDisplaced/IntroAnimation.svelte';

	const { blok, className } = $props();
</script>

<div
	use:storyblokEditable={blok}
	class={`intro-view--wrapper ${className}`}
	style={`
		height: ${blok.screenHeightInPercent || 100}vh;
		height: ${blok.screenHeightInPercent || 100}svh;
		background-image: ${blok.backgroundImage?.filename ? `url(${blok.backgroundImage.filename})` : 'url(/assets/ldd/patterns/fabric-pattern.png)'};
	`}
>
	<IntroAnimation {blok} />
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

<style>
	.intro-view--wrapper {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh;
		padding: 2rem;
		margin-top: -6rem;
		border-bottom: 6px solid inherit;
		z-index: 0;
		background-color: #ffe0b5;
	}

	.intro-title {
		position: absolute;
		top: 8rem;
		left: 2.5rem;
		padding-top: 0.75rem;
		/* border-left: 6px solid #A4AF69;
		padding-left: 1rem; */
	}

	:global(.arabic .intro-title) {
		left: unset;
		right: 2.5rem;
	}

	.intro-credit {
		position: absolute;
		bottom: 3rem;
		left: 2.5rem;
		max-width: 65%;
	}

	:global(.arabic .intro-credit) {
		left: unset;
		right: 2.5rem;
	}

	@media screen and (max-width: 640px) {
		.intro-title {
			top: 5rem;
			left: 1rem;
			text-align: left;
		}

		:global(.arabic .intro-title) {
			left: unset;
			right: 1rem;
		}

		.intro-credit {
			bottom: 1.5rem;
			left: 1rem;
		}

		:global(.arabic .intro-credit) {
			left: unset;
			right: 1rem;
		}
	}
</style>

<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	//@ts-ignore
	// import IntroAnimation from '$lib/components/projects/LebanonDisplaced/IntroAnimation.svelte';

	const { blok, className } = $props();

	const hasDesktopImage = !!blok.backgroundImage?.filename;
	const hasMobileImage = !!blok.backgroundImageMobile?.filename;

	const bgImage = hasDesktopImage
		? `${blok.backgroundImage.filename}/m/1280x0/filters:format(webp):quality(50)`
		: '';

	const bgImageMobile = hasMobileImage
		? `${blok.backgroundImageMobile.filename}/m/800x0/filters:format(webp):quality(50)`
		: bgImage; // fallback to desktop if mobile is missing
</script>

<svelte:head>
	<link rel="preload" as="image" href={bgImage} />
	<link rel="preload" as="image" href={bgImageMobile} media="(max-width: 825px)" />
</svelte:head>

<div
	use:storyblokEditable={blok}
	class={`intro-view--wrapper z-10 border-b-4 border-lebgreen ${className}`}
	style={`
	--intro-bg-desktop: ${bgImage ? `url("${bgImage}")` : 'none'};
	--intro-bg-mobile: ${bgImageMobile ? `url("${bgImageMobile}")` : 'none'};
	background-color: ${blok.backgroundColor};
`}
>
	<!-- <IntroAnimation {blok} /> -->
	<div class="intro-text -z-1">
		<div class="intro-title text-shadow">
			{#if blok.title.length > 0}
				{#each blok.title as item}
					<StoryblokComponent blok={item} />
				{/each}
			{:else}
				<h1>Lebanon Displacement Diaries</h1>
			{/if}
		</div>
		<div class="intro-credit text-shadow">
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
		justify-content: flex-start;
		align-items: center;
		width: 100%;
		height: 100vh;
		padding: 2rem;
		margin-top: -6rem;
		border-bottom: 6px solid inherit;
		z-index: 0;
		background-image: var(--intro-bg-desktop);
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
	}

	@media screen and (max-width: 800px) {
		.intro-view--wrapper {
			padding: 0.5rem 1rem 1rem;
			height: 100svh !important;
			background-image: var(--intro-bg-mobile);
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
		max-width: 45%;
		padding-top: 4.5rem;
	}

	@media screen and (max-width: 800px) {
		.intro-text {
			max-width: 100%;
			padding-top: 5.25rem;
			justify-content: start;
		}
	}

	@media screen and (max-width: 475px) {
		.intro-text {
			padding-top: 5.25rem;
		}
	}

	.intro-title {
		overflow: visible;
	}

	:global(.storyblok--richtext .intro-text h1) {
		/* font-size: 8rem !important; */
		line-height: 1.2;
		margin-bottom: 0.5rem;
	}

	:global(.arabic .intro-title) {
		right: 2.5rem;
		left: unset;
	}

	.intro-credit {
		max-width: 90%;
	}

	@media screen and (max-width: 640px) {
		.intro-credit {
			max-width: 100%;
			margin-top: 1rem;
		}
	}

	.text-shadow {
		text-shadow:
			0 0 15px rgba(255, 225, 181, 0.6),
			0 0 10px rgba(255, 225, 181, 0.6);
	}

	:global(.arabic .intro-credit) {
		right: 2.5rem;
		left: unset;
	}

	@media screen and (max-width: 640px) {
		:global(.arabic .intro-title) {
			right: 1rem;
			left: unset;
		}

		:global(.arabic .intro-credit) {
			right: 1rem;
			left: unset;
		}
	}
</style>

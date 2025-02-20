<script lang="ts">
	import { onMount } from 'svelte';
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	// import { getContext } from 'svelte';

	export let blok;

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const gsapModule = await import('gsap');
			const ScrollTriggerModule = await import('gsap/ScrollTrigger');

			const gsap = gsapModule.default;
			const ScrollTrigger = ScrollTriggerModule.default;
			gsap.registerPlugin(ScrollTrigger);

			let scrollContainer = document.querySelector('.horizontal-scroll-container');
			if (!scrollContainer) return;
			let scrollWidth = scrollContainer.scrollWidth;
			let viewportWidth = document.querySelector('main')?.offsetWidth || window.innerWidth;

			gsap.to(scrollContainer, {
				x: () => -(scrollWidth - viewportWidth),
				ease: 'linear',
				scrollTrigger: {
					trigger: '.horizontal-scroll-wrapper',
					start: 'top top',
					end: () => `+=${scrollWidth - viewportWidth}`,
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true
				},
				force3D: true,
				autoAlpha: 1
			});
		}
	});
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class="horizontal-scroll-wrapper hidden sm:flex"
>
	<div class="horizontal-scroll-container">
		{#if blok?.items}
			{#each blok.items as item (item._uid)}
				<div class="horizontal-section">
					<div class="horizontal-section--inside">
						<StoryblokComponent blok={item} />
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<div class="vertical-scroll-wrapper block sm:hidden">
	{#if blok?.items}
		{#each blok.items as item (item._uid)}
			<div class="vertical-scroll-container">
				<StoryblokComponent blok={item} />
			</div>
		{/each}
	{/if}
</div>

<style>
	.horizontal-scroll-wrapper {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		align-items: center;
	}

	.horizontal-scroll-container {
		display: flex;
		flex-wrap: nowrap;
	}

	.horizontal-section {
		width: 800px;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
	}

	@media screen and (max-width: 1400px) {
		.horizontal-section {
			width: 600px;
		}
	}
	@media screen and (max-width: 1000px) {
		.horizontal-section {
			width: 460px;
		}
	}

	.horizontal-section--inside {
		display: flex;
		height: auto;
		align-items: center;
		justify-content: center;
		color: black;
		width: 100%;
		/* font-weight: bold; */
	}

	.vertical-scroll-container {
		max-width: 320px;
		margin: 2rem auto;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

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
				ease: 'none',
				scrollTrigger: {
					trigger: '.horizontal-scroll-wrapper',
					start: 'top top',
					end: () => `+=${scrollWidth - viewportWidth}`,
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true,
					markers: false
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
	{#if blok.title}
		<div class="horizontal-scroll-wrapper--title-container">
			<h2 class={`horizontal-scroll-wrapper--title pt-32 font-amman font-bold ${blok.textColor}`}>
				{blok.title}
			</h2>
		</div>
	{/if}
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
	<!-- <div class="torn-paper torn-paper--bottom"></div> -->
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
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		align-items: center;
		margin: 5rem 0;
		/* background-color: #f7f7f7; */
		/* RGBA for #e3c09a */
		/* background-color: rgba(227, 192, 154, 0.9); */
		/* background-color: rgba(0, 0, 0, 0.5); */
		/* box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19); */
	}
	.horizontal-scroll-container {
		position: absolute;
		display: flex;
		flex-wrap: nowrap;
		top: 0;
		left: 0;
	}

	.horizontal-scroll-wrapper--title-container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
	}

	.horizontal-section {
		width: 800px;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		padding-top: 5rem;
	}

	:global(.pin-spacer) {
		margin-bottom: 0 !important;
	}

	/* .horizontal-scroll-wrapper--title {
		font-family: 'Pacifico', cursive;
		font-size: 2rem;
	} */

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

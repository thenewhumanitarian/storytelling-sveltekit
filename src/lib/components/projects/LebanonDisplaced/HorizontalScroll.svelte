<script lang="ts">
	import { onMount } from 'svelte';
	import MouseoverBox from './MouseoverBox.svelte';

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
			// let viewportWidth = window.innerWidth;
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
				}
			});
		}
	});
</script>

<div class="horizontal-scroll-wrapper scroll-smooth">
	<div class="horizontal-scroll-container">
		<div class="horizontal-section">
			<div class="horizontal-section--inside">
				<MouseoverBox />
			</div>
		</div>
		<div class="horizontal-section">
			<div class="horizontal-section--inside">
				<MouseoverBox />
			</div>
		</div>
		<div class="horizontal-section">
			<div class="horizontal-section--inside">
				<MouseoverBox />
			</div>
		</div>
	</div>
</div>

<style>
	h2,
	h3 {
		font-family: 'Pacifico', cursive;
	}

	.horizontal-scroll-wrapper {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		z-index: -1;
		/* background-color: rgba(0, 0, 0, 0.8); */
	}

	.horizontal-scroll-container {
		margin-top: 4rem;
		display: flex;
		flex-wrap: nowrap;
		white-space: nowrap;
	}

	.horizontal-section {
		/* width: 80vw; */
		width: 800px;
		margin: 0 4rem;
		height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		/* background: red; */
	}

	@media screen and (max-width: 1400px) {
		.horizontal-section {
			width: 800px;
			margin: 0 4rem;
		}
	}

	@media screen and (max-width: 1400px) {
		.horizontal-section {
			width: 600px;
			margin: 0 8rem;
		}
	}

	@media screen and (max-width: 1000px) {
		.horizontal-section {
			width: 460px;
			margin: 0 6rem;
		}

		.horizontal-scroll-container {
			margin-top: 4rem;
		}
	}

	.horizontal-section--inside {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: black;
		width: 100%;
		margin: 0.2rem;
		height: calc(100% - 0.4rem);
	}
</style>

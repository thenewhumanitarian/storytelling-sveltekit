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
		/* margin-top: 4rem; */
		margin-top: 2rem; /* For the header */
		display: flex;
		flex-wrap: nowrap;
		white-space: nowrap;
	}

	.horizontal-section {
		/* width: 80vw; */
		width: 80vw;
		height: 80vh;
		margin: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		/* box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2); */
		/* background: linear-gradient(45deg, #d40000, #fff, #007a3d); */
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

	@media screen and (max-width: 640px) {
		.horizontal-scroll-container {
			/* margin-left: 5rem; */
			/* margin-right: 10vw; */
		}

		.horizontal-section {
			margin-right: 5rem;
		}

		.horizontal-section:first-child {
			margin-left: 5rem;
		}

		/* .horizontal-section:last-child {
			margin-right: 5rem;
		} */
	}
</style>

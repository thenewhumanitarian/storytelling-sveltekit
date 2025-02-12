<script>
	import { onMount } from 'svelte';

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
				ease: 'none',
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

<div class="horizontal-scroll-wrapper">
	<div class="horizontal-scroll-container">
		<div class="horizontal-section">
			<div class="horizontal-section--inside"><h3>Section 1</h3></div>
		</div>
		<div class="horizontal-section">
			<div class="horizontal-section--inside"><h3>Section 2</h3></div>
		</div>
		<div class="horizontal-section">
			<div class="horizontal-section--inside"><h3>Section 3</h3></div>
		</div>
		<div class="horizontal-section">
			<div class="horizontal-section--inside"><h3>Section 4</h3></div>
		</div>
	</div>
</div>

<style>
	.horizontal-scroll-wrapper {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		z-index: -1;
	}

	.horizontal-scroll-container {
		margin-top: 3rem;
		display: flex;
		flex-wrap: nowrap;
		white-space: nowrap;
	}

	.horizontal-section {
		width: 80vw;
		height: 80vh;
		margin: 2rem;
		background: linear-gradient(45deg, #d40000, #fff, #007a3d);
		box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		/* border-radius: 20px; */
	}

	.horizontal-section--inside {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: bold;
		color: black;
		position: static;
		width: 100%;
		height: 98%;
		background: rgba(255, 255, 255, 0.95);
	}
</style>

<script>
	// import FadeIn from '$lib/components/animations/FadeIn.svelte';
	const { children, mouseOver = true } = $props();
</script>

<!-- <FadeIn duration={1} delay={1} isAbsolute={true} blurAmount={20}> -->
<div
	class={`scrap-book-paper relative flex h-full w-full items-center justify-center ${mouseOver ? 'has-mouseover' : ''}`}
>
	{@render children?.()}
</div>

<!-- </FadeIn> -->

<style>
	.scrap-book-paper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* background: red; */
		background: url('/assets/ldd/patterns/scrapbook-paper--white.png') no-repeat top center;
		background-size: cover;
		transform: scale(1) translateY(0) rotate(-1deg);
		transition: transform 3s ease-in-out;
	}

	.scrap-book-paper.has-mouseover:hover {
		transform: scale(1.15) translateY(-8%) rotate(3deg);
		z-index: 999;
	}

	@media screen and (max-width: 1250px) {
		.scrap-book-paper.has-mouseover:hover {
			transform: scale(1.15) translate(-5%, -11%) rotate(2deg);
		}
	}

	/* TO DO: Create different scenario for <825px */
	/* @media screen and (max-width: 825px) {

	} */

	@keyframes zoomInEffect {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.25) translateY(-10px) rotate(0deg);
		}
	}

	@keyframes zoomInEffect2 {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.15) translateY(-10px) rotate(0deg);
		}
	}

	@keyframes floatEffect {
		0% {
			transform: translateY(0px) rotate(4deg);
		}
		50% {
			transform: translateY(15px);
		}
		100% {
			transform: translateY(0px) rotate(3deg);
		}
	}
</style>

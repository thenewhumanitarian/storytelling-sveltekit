<script>
	// import FadeIn from '$lib/components/animations/FadeIn.svelte';
	const { children, mouseOver = true, maxWidthMobile = '100%' } = $props();
</script>

<!-- <FadeIn duration={1} delay={1} isAbsolute={true} blurAmount={20}> -->
<div
	class={`scrap-book-paper relative flex h-full w-full items-center justify-center ${mouseOver ? 'has-mouseover' : ''}`}
	style={`--max-width-mobile: ${maxWidthMobile};`}
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
		background: url('/assets/ldd/patterns/scrapbook-paper--white.webp') no-repeat top center;
		background-size: contain;
		transform: scale(1) translateY(0) rotate(1deg);
		transition: transform 0.5s ease-in-out;
	}

	:global(.arabic .scrap-book-paper) {
		transform: scale(1) translateY(0) rotate(-1deg);
	}

	.scrap-book-paper.has-mouseover:hover {
		transform: scale(1.1) translateX(-2vw) translateY(-5vh) rotate(-2deg);
		z-index: 999;
	}

	:global(.arabic .scrap-book-paper.has-mouseover:hover) {
		transform: scale(1.1) translateX(2vw) translateY(-4vh) rotate(2deg);
		z-index: 999;
	}

	@media screen and (max-width: 1250px) {
		.scrap-book-paper.has-mouseover:hover {
			transform: scale(1.15) translateX(-2.5vw) translateY(-2.5vh) rotate(-2deg);
			z-index: 999;
		}

		:global(.arabic .scrap-book-paper.has-mouseover:hover) {
			transform: scale(1.1) translateX(2.5vw) translateY(-2.5vh) rotate(2deg);
			z-index: 999;
		}
	}

	/* TO DO: Create different scenario for <825px */
	/* @media screen and (max-width: 825px) {

	} */

	@media screen and (max-width: 640px) {
		.scrap-book-paper {
			max-width: var(--max-width-mobile);
		}
	}
</style>

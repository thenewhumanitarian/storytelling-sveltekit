<script>
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	const { children } = $props();
</script>

<!-- <FadeIn duration={1} delay={1} isAbsolute={true} blurAmount={20}> -->
<div class="scrap-book-paper relative flex h-full w-full items-center justify-center">
	{@render children?.()}
	<!-- Scotch tape pieces -->
	<span class="tape tape-tl"></span>
	<span class="tape tape-tr"></span>
	<span class="tape tape-bl"></span>
	<span class="tape tape-br"></span>
</div>

<!-- </FadeIn> -->

<style>
	.scrap-book-paper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* background: red; */
		background: url('/assets/ldd/patterns/scrapbook-paper--white.png') no-repeat center center;
		background-size: contain;
	}

	.scrap-book-paper:not(:hover) {
		animation: floatEffect 8s ease-in-out infinite;
	}

	.scrap-book-paper:hover {
		animation: zoomInEffect 1s ease-in-out 1 both;
	}

	@media screen and (max-width: 1250px) {
		.scrap-book-paper:hover {
			animation: zoomInEffect2 1s ease-in-out 1 both;
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

	/* Scotch tape corner pieces */
	:root {
		--tape-color: #dbd8be;
		--tape-opacity: 0.6;
		--tape-size: 45px;
		--tape-width: 65px;
		--tape-height: 35px;
	}
	.tape {
		position: absolute;
		width: var(--tape-width);
		height: var(--tape-height);
		background: var(--tape-color);
		opacity: var(--tape-opacity);
		pointer-events: none;
		will-change: opacity;
		transition: opacity 0.4s;
	}

	/* Corners */
	.tape-tl {
		top: calc(var(--tape-height) * -0.25);
		left: calc(var(--tape-width) * -0.35);
		transform: rotate(-45deg);
	}

	.tape-tr {
		top: calc(var(--tape-height) * -0.25);
		right: calc(var(--tape-width) * 0);
		transform: rotate(45deg);
	}

	.tape-bl {
		bottom: calc(var(--tape-width) * -0.15);
		left: calc(var(--tape-width) * -0.35);
		transform: rotate(45deg);
	}

	.tape-br {
		bottom: calc(var(--tape-width) * -0.15);
		right: calc(var(--tape-width) * -0.35);
		transform: rotate(-45deg);
	}
</style>

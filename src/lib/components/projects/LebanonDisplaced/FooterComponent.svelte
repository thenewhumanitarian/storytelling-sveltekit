<script>
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	import { createIsRtlStore } from '$lib/utils/storyblok';
	const isRtl = createIsRtlStore();
</script>

<footer
	class={`flex items-center`}
	style={`justify-content: ${isRtl ? 'flex-end' : 'flex-start'};`}
>
	<div class="torn-paper torn-paper--bottom"></div>
	<div class={`footer--logo w-auto ${isRtl ? 'text-right ' : 'text-left'}`}>
		<FadeIn duration={2000} yOffset={0} blurAmount={30}>
			<h1>The Lebanon Displacement Diaries</h1>
		</FadeIn>
	</div>
</footer>

<style>
	footer {
		position: relative;
		background-color: #282828;
		box-shadow: 0px -10px 30px rgba(0, 0, 0, 0.2);
		padding: 5rem 3rem 3rem 3rem;
	}

	.footer--logo h1 {
		/* Adjust header logo too if changed here */
		font-size: 4rem;
		max-width: 320px;
		font-size: 4rem;
		line-height: 0.875;
		margin-bottom: 2rem;
		letter-spacing: -2px;
		color: #ffe0b5;
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		/* border-left: 6px solid #ffe0b5;
		padding-left: 1rem; */
		/* line-height: 1; */
		/* color: #ede580; */
	}

	@media screen and (max-width: 640px) {
		.footer--logo h1 {
			font-size: 2.3rem !important;
			width: 100%;
			line-height: 1;
			margin: 0;
		}
	}
	:global(.torn-paper--bottom) {
		position: absolute;
		height: 5rem;
		overflow: hidden;
		top: -5rem;
		background-image: url('/assets/ldd/patterns/torn-paper--bottom@2x.png');
		background-size: contain;
	}
</style>

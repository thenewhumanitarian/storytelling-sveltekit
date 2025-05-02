<script>
	import { getContext } from 'svelte';

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	import FadeIn from '$lib/components/animations/FadeIn.svelte';
</script>

<footer class={`flex items-center ${isRtl ? 'flex-end flex-row-reverse' : 'flex-start flex-row'}`}>
	<div class="torn-paper torn-paper--bottom"></div>
	<div class={`footer--logo w-full ${isRtl ? 'text-right' : 'text-left'}`}>
		<FadeIn
			duration={2000}
			yOffset={0}
			blurAmount={30}
			containerClasses={`flex w-full ${isRtl ? 'justify-end' : 'justify-start'}`}
		>
			<h1>The<br />Lebanon<br />Displacement<br />Diaries</h1>
		</FadeIn>
	</div>
	<div class={`text-brown ${isRtl ? 'text-left' : 'text-right'}`}>
		<a class="font-medium hover:underline" href={'#'}><p>Footer</p></a>
		<a class="font-medium hover:underline" href={'#'}><p>Links/Content</p></a>
		<a class="font-medium hover:underline" href={'#'}><p>To</p></a>
		<a class="font-medium hover:underline" href={'#'}><p>Be</p></a>
		<a class="font-medium hover:underline" href={'#'}><p>Done</p></a>
	</div>
</footer>

<style>
	footer {
		position: relative;
		background-color: #282828;
		box-shadow: 0px -10px 30px rgba(0, 0, 0, 0.2);
		padding: 5.75rem 3rem 3rem 3rem;
	}

	@media screen and (max-width: 1200px) {
		footer {
			padding: 4.75rem 2rem 2rem 2rem;
		}
	}

	@media screen and (max-width: 900px) {
		footer {
			padding: 3.75rem 1rem 1rem 1rem;
		}
	}

	@media screen and (max-width: 640px) {
		footer {
			padding: 2.75rem 1rem 2rem 1rem;
		}
	}

	.footer--logo h1 {
		/* Adjust header logo too if changed here */
		font-size: 4rem;
		/* max-width: 320px; */
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
		margin-top: 1rem;
		background-image: url('/assets/ldd/patterns/torn-paper--bottom--small.webp');
		background-size: cover;
		/* background-color: white; */
		/* background-image: url('/assets/ldd/patterns/torn-cardboard--bottom.png'); */
	}
</style>

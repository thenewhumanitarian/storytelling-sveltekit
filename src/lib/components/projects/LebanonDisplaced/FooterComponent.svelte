<script>
	import { getContext } from 'svelte';

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	import FadeIn from '$lib/components/animations/FadeIn.svelte';
</script>

<footer
	class={`flex items-center ${isRtl ? 'flex-end flex-col sm:flex-row-reverse' : 'flex-start flex-col gap-y-5 sm:flex-row'}`}
>
	<div class="torn-paper torn-paper--bottom"></div>
	<div class={`footer--logo w-full ${isRtl ? 'text-right' : 'text-left'}`}>
		<FadeIn
			duration={2000}
			yOffset={0}
			blurAmount={30}
			containerClasses={`flex w-full ${isRtl ? 'justify-end' : 'justify-start'}`}
		>
			{#if isRtl}
				<h1 style="line-height: 1.1;">يوميات<br />النزوح في<br />لبنان</h1>
			{:else}
				<h1>The<br />Lebanon<br />Displacement<br />Diaries</h1>
			{/if}
		</FadeIn>
	</div>
	<div class={`w-full text-brown ${isRtl ? 'text-left' : 'text-right'}`}>
		{#if isRtl}
			<h2 class="text-2xl text-brown">نهاية الحرب ليست بنهاية القصة.</h2>
		{:else}
			<h2 class="text-2xl text-brown">The end of a war is not the end of the story.</h2>
		{/if}
		<p>
			Illustrations by <a
				class="font-medium hover:underline"
				target="_blank"
				rel="noopener noreferrer"
				href={'https://www.instagram.com/sasha.haddad.illustrations/'}>Sasha Haddad</a
			>
		</p>
		<a class="font-medium hover:underline" href={'#'}><p>About this project</p></a>
		<p>Back <a class="font-medium hover:underline" href={'#'}>to The New Humanitarian</a></p>
		<!-- <a class="font-medium hover:underline" href={'#'}><p>Images by Pexel</p></a> -->
	</div>
</footer>

<style>
	footer {
		position: relative;
		background-color: #282828;
		box-shadow: 0px -10px 20px rgba(0, 0, 0, 0.2);
		padding: 4rem 3rem 4rem 3rem;
	}

	@media screen and (max-width: 1200px) {
		footer {
			padding: 2rem;
		}
	}

	@media screen and (max-width: 900px) {
		footer {
			padding: 1rem 1rem 2rem 1rem;
		}
	}

	.footer--logo h1 {
		/* Adjust header logo too if changed here */
		font-size: 4rem;
		line-height: 0.875;
		letter-spacing: -2px;
		color: #ffe0b5;
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
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
		overflow: hidden;
	}
</style>

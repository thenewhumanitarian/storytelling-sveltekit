<script lang="ts">
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import HorizontalScroll from '$lib/components/projects/LebanonDisplaced/HorizontalScroll.svelte';
	import MouseoverBox from '$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte';
</script>

<div class="content-wrapper">
	<h1 class="text-xl sm:text-3xl">A few ideas and prototypes for this project.</h1>
</div>

<div class="content-wrapper transparent">
	<MouseoverBox
		object={false}
		photo={false}
	/>
</div>

<div class="content-wrapper">
	<h2>From the bottom.</h2>
	<FadeIn yOffset={50} blurAmount={10}>
		<p>Hello, I fade in smoothly!</p>
	</FadeIn>
	<code>
		yOffset={50} blurAmount={10}
	</code>
</div>

<div class="content-wrapper">
	<h2>Default</h2>
	<FadeIn>
		<p>This is the default without setting anything special.</p>
	</FadeIn>
</div>

<div class="content-wrapper">
	<h2>With delay...</h2>
	<FadeIn delay={1000} duration={1000} blurAmount={10}>
		<p>This paragraph fades in slightly later.</p>
	</FadeIn>
	<code>delay={1000} duration={1000} blurAmount={10}</code>
</div>

<HorizontalScroll />

<div class="content-wrapper">
	<h2>From the far left</h2>
	<FadeIn xOffset={-1000}>
		<p>This here comes from the far left.</p>
	</FadeIn>
	<code>xOffset=-1000</code>
</div>

<div class="content-wrapper">
	<h2>From the top left</h2>
	<FadeIn blurAmount={10} xOffset={-50} yOffset={-50}>
		<p>This here comes from the top left and is also un-blurring.</p>
	</FadeIn>
	<code>blurAmount={10} xOffset={-50} yOffset={-50}</code>
</div>

<style>
	.content-wrapper {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		flex-direction: column;
		row-gap: 1rem;
		width: 80%;
		max-width: 800px;
		margin: 0 auto 2rem auto;
		/* aspect-ratio: 3/2; */
	}

	/* Avoid margin-bottom when two .content-wrapper are next to each other */
	.content-wrapper + .content-wrapper {
		margin: 0 auto 2rem auto;
	}

	.content-wrapper.transparent {
		background-color: transparent;
	}

	.content-wrapper:last-child {
		margin-bottom: 0;
	}

	div:not(:first-child) {
		margin-top: 2rem;
	}
	div:nth-child(odd) {
		background-color: rgba(255, 255, 255, 0.95);
	}

	div:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.95);
	}

	h1 {
		font-weight: bold;
	}
	h1,
	h2 {
		margin: 0;
	}
	h2 {
		font-family: 'Pacifico', cursive;
		font-size: 1.8rem;
		line-height: 1.25;
	}

	@media screen and (max-width: 640px) {
		h2 {
			font-size: 1.4rem;
			line-height: 1;
		}
	}
	code {
		color: #282828;
		background: #ddd;
		padding: 0.5rem 1rem;
	}
</style>

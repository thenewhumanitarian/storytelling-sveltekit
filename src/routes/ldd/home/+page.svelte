<script lang="ts">
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
</script>

<div>
	<h1>A few simple FadeIn animations triggered by the viewport using svelte-inview.</h1>
</div>

<div>
	<h2>From the bottom.</h2>
	<FadeIn yOffset={50} blurAmount={10}>
		<p>Hello, I fade in smoothly!</p>
	</FadeIn>
	<code>
		yOffset={50} blurAmount={10}
	</code>
</div>

<div>
	<h2>Default</h2>
	<FadeIn>
		<p>This is the default without setting anything special.</p>
	</FadeIn>
</div>

<div>
	<h2>With delay...</h2>
	<FadeIn delay={1000} duration={1000} blurAmount={10}>
		<p>This paragraph fades in slightly later.</p>
	</FadeIn>
	<code>delay={1000} duration={1000} blurAmount={10}</code>
</div>

<div>
	<h2>From the right with early onset</h2>
	<FadeIn xOffset={500} blurAmount={10} inViewOffset={'-25%'}>
		<p>
			This here comes from the right and also uses inViewOffset to trigger the animation slightly
			later.
		</p>
	</FadeIn>
	<code>
		xOffset={500} blurAmount={10} inViewOffset={'-25%'}
	</code>
</div>

<div>
	<h2>From the far left</h2>
	<FadeIn xOffset={-1000}>
		<p>This here comes from the far left.</p>
	</FadeIn>
	<code>xOffset=-1000</code>
</div>

<div>
	<h2>From the top left</h2>
	<FadeIn blurAmount={10} xOffset={-50} yOffset={-50}>
		<p>This here comes from the top left and is also un-blurring.</p>
	</FadeIn>
	<code>blurAmount={10} xOffset={-50} yOffset={-50}</code>
</div>

<style>
	div {
		padding: 1rem;
		height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow-x: hidden;
		text-align: center;
		flex-direction: column;
		row-gap: 1rem;
	}
	div:nth-child(odd) {
		background-color: cornsilk;
    background-color: rgba(255, 248, 220, 0.95);
	}

	div:nth-child(even) {
		background-color: white;
	}
	h1,
	h2 {
		margin: 0;
	}
	code {
		color: #282828;
		background: #ddd;
		padding: 0.5rem 1rem;
	}
</style>

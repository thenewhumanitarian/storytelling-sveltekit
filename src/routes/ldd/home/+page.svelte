<script lang="ts">
	import FadeIn from '$lib/components/ui/FadeIn.svelte';
</script>

<div>
	<h1>Testing a few inView animations.</h1>
</div>

<div>
	<FadeIn>
		<p>This is the default without setting anything special.</p>
	</FadeIn>
</div>

<div>
	<FadeIn yOffset={50} blurAmount={10}>
		<h1>Hello, I fade in smoothly! From the bottom.</h1>
	</FadeIn>
</div>

<div>
	<FadeIn delay={1000} duration={1000} blurAmount={10}>
		<p>This paragraph fades in slightly later – 200ms delay and 1,000ms duration...</p>
	</FadeIn>
</div>

<div>
	<FadeIn xOffset={500} blurAmount={10}>
		<p>This here comes from the right (xOffset = 500).</p>
	</FadeIn>
</div>

<div>
	<FadeIn xOffset={-1000}>
		<p>This here comes from the (far) left) (xOffset = -1000).</p>
	</FadeIn>
</div>

<div>
	<FadeIn blurAmount={10} xOffset={-50} yOffset={-50}>
		<p>This here comes from the top left (xOffset = -50, yOffset = -50).</p>
	</FadeIn>
</div>

<style>
	div {
		padding: 1rem;
		height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	div:nth-child(odd) {
		background-color: #ffee99;
	}
</style>

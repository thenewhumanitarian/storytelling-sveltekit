<script lang="ts">
	import FadeIn from '$lib/components/ui/FadeIn.svelte';
</script>

<div></div>
<div></div>
<div>
	<FadeIn>
		<h1>Hello, I fade in smoothly!</h1>
	</FadeIn>
</div>

<div>
	<FadeIn delay={200} duration={700}>
		<p>This paragraph fades in slightly later.</p>
	</FadeIn>
</div>

<div>
	<FadeIn yOffset={50} offset="-20%">
		<button>Fading Button</button>
	</FadeIn>
</div>
<div></div>
<div></div>

<style>
	div {
		padding: 1rem;
		height: 60vh;
	}
	div:nth-child(odd) {
		background-color: #f0f0f0;
	}
</style>

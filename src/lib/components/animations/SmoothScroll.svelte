<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let locoScroll;

	onMount(async () => {
		const LocomotiveScroll = (await import('locomotive-scroll')).default;

		locoScroll = new LocomotiveScroll({
			el: document.querySelector('main'),
			smooth: true,
			smoothMobile: false,
			// lerp: 0.08, // Adjust for more or less smoothness
			// multiplier: 0.5 // Speed of scrolling
		});
	});

	onDestroy(() => {
		if (locoScroll) locoScroll.destroy();
	});
</script>

<div id="smooth-scroll">
	<slot />
</div>

<style>
	#smooth-scroll {
		overflow: hidden;
		position: relative;
		width: 100%;
	}
</style>

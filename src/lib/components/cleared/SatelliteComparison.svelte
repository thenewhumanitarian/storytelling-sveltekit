<script lang="ts">
	import { onMount } from 'svelte';
	import SatelliteSlider from './SatelliteSlider.svelte';
	import SatelliteScrolly from './SatelliteScrolly.svelte';

	let isMobile = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(max-width: 640px)');
		isMobile = mq.matches;
		const handler = (e: MediaQueryListEvent) => { isMobile = e.matches; };
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

{#if isMobile}
	<SatelliteScrolly
		beforeImage="/images/cleared/satellite/charuabakhra_1_past.png"
		afterImage="/images/cleared/satellite/charuabakhra_1_today.png"
		beforeLabel="Before"
		afterLabel="January 2026"
		location="Charuabakhra"
	/>

	<SatelliteScrolly
		beforeImage="/images/cleared/satellite/sonapur_1_past.png"
		afterImage="/images/cleared/satellite/sonapur_1_today.png"
		beforeLabel="Before"
		afterLabel="January 2026"
		location="Sonapur"
	/>
{:else}
	<div class="satellite-comparison">
		<SatelliteSlider
			beforeImage="/images/cleared/satellite/charuabakhra_1_past.png"
			afterImage="/images/cleared/satellite/charuabakhra_1_today.png"
			beforeLabel="Before"
			afterLabel="January 2026"
			location="Charuabakhra"
		/>

		<SatelliteSlider
			beforeImage="/images/cleared/satellite/sonapur_1_past.png"
			afterImage="/images/cleared/satellite/sonapur_1_today.png"
			beforeLabel="Before"
			afterLabel="January 2026"
			location="Sonapur"
		/>
	</div>
{/if}

<style>
	.satellite-comparison {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem 0;
		max-width: 900px;
		margin: 0 auto;
	}
</style>

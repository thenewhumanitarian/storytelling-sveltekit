<script lang="ts">
	import SatelliteSlider from './SatelliteSlider.svelte';
</script>

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

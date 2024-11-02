<script lang="ts">
	import SyriaMap from '$lib/components/SyriaMap/Map.svelte';
	import { MAP_DATA } from '$lib/components/SyriaMap/data.js';

	// Variable to store the selected marker data
	let selectedMarker = null;

	// Callback function to handle marker clicks
	function handleMarkerClick(markerData) {
		selectedMarker = markerData;
	}
</script>

<section class="w-full">
	<!-- Pass the callback to SyriaMap as markerClickHandler -->
	<SyriaMap data={MAP_DATA} markerClickHandler={handleMarkerClick} />
</section>

<!-- Display the selected marker information or a default message -->
<div class="marker-info">
	{#if selectedMarker}
		<h3 class="mb-0 text-2xl">{selectedMarker.name}</h3>
		<h4 class="mb-2 mt-0 text-xl">{selectedMarker.profession}</h4>
		<p>{selectedMarker.text}</p>
	{:else}
		<p>Click on the markers to read more about the people.</p>
	{/if}
</div>

<style>
	.marker-info {
		padding: 1rem;
		background-color: #f6f6f6;
		margin-top: 0;
	}
</style>

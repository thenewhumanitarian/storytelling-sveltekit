<script lang="ts">
	import SyriaMap from '$lib/components/SyriaMap/Map.svelte';
	import { MAP_DATA } from '$lib/components/SyriaMap/data.js';

	// Variable to store the selected marker ID
	let selectedMarkerId = $state(-1);

	// Callback function to handle marker clicks
	function handleMarkerClick(markerId: number) {
		selectedMarkerId = markerId;
	}

	// Function to get the currently selected marker data
	function getSelectedMarker() {
		return MAP_DATA.markers.find((marker) => marker.popup.id === selectedMarkerId) || null;
	}

	// Navigate to the previous marker, wrapping around to the last marker if at the start
	function previousMarker() {
		const currentIndex = MAP_DATA.markers.findIndex(
			(marker) => marker.popup.id === selectedMarkerId
		);
		const newIndex = currentIndex > 0 ? currentIndex - 1 : MAP_DATA.markers.length - 1;
		selectedMarkerId = MAP_DATA.markers[newIndex].popup.id;
	}

	// Navigate to the next marker, wrapping around to the first marker if at the end
	function nextMarker() {
		const currentIndex = MAP_DATA.markers.findIndex(
			(marker) => marker.popup.id === selectedMarkerId
		);
		const newIndex = currentIndex < MAP_DATA.markers.length - 1 ? currentIndex + 1 : 0;
		selectedMarkerId = MAP_DATA.markers[newIndex].popup.id;
	}
</script>

<main data-iframe-height={true}></main>
<section class="w-full" data-iframe-height={true}>
	<!-- Pass selectedMarkerId to SyriaMap as a prop -->
	<SyriaMap data={MAP_DATA} markerClickHandler={handleMarkerClick} {selectedMarkerId} />
</section>

<!-- Display the selected marker information or a default message -->
<div class="marker-info">
	{#if getSelectedMarker()}
		<div class="flex w-full flex-col">
			<div class="flex w-full justify-between">
				<button on:click={previousMarker}>← Previous</button>
				<button on:click={nextMarker}>Next →</button>
			</div>
			<div class="mt-3">
				<h3 class="mb-0 text-2xl">{getSelectedMarker().popup.name}</h3>
				<h4 class="mb-2 mt-0 text-xl">{getSelectedMarker().popup.profession}</h4>
				<p>{getSelectedMarker().popup.text}</p>
			</div>
		</div>
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

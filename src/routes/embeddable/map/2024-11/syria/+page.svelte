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
<section class="relative w-full" data-iframe-height={true}>
	<!-- Pass selectedMarkerId to SyriaMap as a prop -->
	<SyriaMap data={MAP_DATA} markerClickHandler={handleMarkerClick} {selectedMarkerId} />
	<!-- Display the selected marker information or a default message -->
	{#if getSelectedMarker()}
		<div class="marker-info bg-zinc-100">
			<div class="flex w-full flex-col">
				<div class="flex w-full justify-between">
					<button onclick={previousMarker}>← Previous</button>
					<button onclick={nextMarker}>Next →</button>
				</div>
				<div class="mt-3">
					<h3 class="mb-0 text-2xl">{getSelectedMarker().popup.name}</h3>
					<h4 class="mb-2 mt-0 text-xl">{getSelectedMarker()?.popup?.profession}</h4>
					<p>{getSelectedMarker().popup.text}</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="absolute bottom-0 left-0 z-50 w-full bg-zinc-100 opacity-100 p-2 sm:p-3">
			<p class="text-center">Click on the red circles to find out more.</p>
		</div>
	{/if}
</section>

<style>
	.marker-info {
		padding: 1rem;
		margin-top: 0;
	}
</style>

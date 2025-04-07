<script lang="ts">
	import GazaMap from '$lib/components/GazaMap/GazaMap.svelte';
	import Timeline from '$lib/components/GazaMap/Timeline.svelte';

	let { data } = $props();
	const { incidentsData } = data;

	let selectedMarkerId = $state<number | null>(null);
	let highlightedMarkerId = $state<number | null>(null);
	let selectedWeekStartDate = $state<Date | null>(null);

	function setSelectedMarkerId(id: number | null) {
		selectedMarkerId = id;
	}
	function setHighlightedMarkerId(id: number | null) {
		highlightedMarkerId = id;
	}
	function setSelectedWeek(date: Date | null, firstIncidentId: number | null) {
		selectedWeekStartDate = date;
		if (date !== null) {
			selectedMarkerId = null; // Clear marker selection if week is selected
			highlightedMarkerId = null; // Also clear highlight
		}
		selectedMarkerId = firstIncidentId;
	}

	let gazaMapRef = $state<{
		setSelectionOriginToClick: () => void;
	} | null>(null);
</script>

<main data-iframe-height={true}>
	<section class="relative flex h-screen w-full flex-col" data-iframe-height={true}>
		<div class="flex-grow">
			<GazaMap
				bind:this={gazaMapRef}
				{selectedMarkerId}
				{setSelectedMarkerId}
				{highlightedMarkerId}
				{setHighlightedMarkerId}
				{incidentsData}
				{selectedWeekStartDate}
			/>
		</div>
		<div class="absolute bottom-0 left-0 z-30 w-full bg-white">
			<Timeline
				{setHighlightedMarkerId}
				{incidentsData}
				{gazaMapRef}
				{selectedWeekStartDate}
				{setSelectedWeek}
			/>
		</div>
	</section>
</main>

<svelte:head>
	<style>
		html,
		body {
			height: 100%;
			margin: 0;
		}
	</style>
</svelte:head>

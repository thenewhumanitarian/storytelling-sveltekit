<script lang="ts">
	import GazaMap from '$lib/components/gaza-map/GazaMap.svelte';
	import Timeline from '$lib/components/gaza-map/Timeline.svelte';
	import GazaCards from '$lib/components/gaza-map/GazaCards.svelte';

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
		flyToMarkerByChronoId: (id: number) => void;
	} | null>(null);
	let gazaCardsRef = $state<any>(null);

	function handleCardInView(id: number) {
		setSelectedMarkerId(id);
		if (gazaMapRef && gazaMapRef.flyToMarkerByChronoId) {
			gazaMapRef.flyToMarkerByChronoId(id);
		}
	}
</script>

<main class="h-screen bg-white">
	<section class="flex flex-col w-full h-full min-h-0">
		<div class="max-h-[80svh] min-h-[120px] flex-grow">
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
		<div class="w-full">
			<GazaCards
				bind:this={gazaCardsRef}
				{incidentsData}
				{selectedMarkerId}
				onCardInView={handleCardInView}
			/>
		</div>
		<div class="z-30 w-full">
			<Timeline
				{setHighlightedMarkerId}
				{incidentsData}
				{gazaMapRef}
				{selectedWeekStartDate}
				{setSelectedWeek}
				{selectedMarkerId}
				scrollToCard={gazaCardsRef ? gazaCardsRef.scrollToCard : undefined}
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
			overflow: hidden;
		}
		.map-container {
			width: 100%;
			height: 100%;
			min-height: 120px;
			max-height: 80svh;
		}
		@media (max-width: 640px) {
			.map-container {
				min-height: 120px;
				max-height: 80svh;
				height: 100%;
			}
		}
	</style>
</svelte:head>

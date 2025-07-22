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

<main data-iframe-height={true}>
	<section class="relative flex h-screen w-full flex-col overflow-hidden" data-iframe-height={true}>
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
		<!-- Cards container (under timeline) -->
		<div class="absolute bottom-[144px] left-0 z-20 w-full bg-white flex">
			<GazaCards
				bind:this={gazaCardsRef}
				incidentsData={incidentsData}
				selectedMarkerId={selectedMarkerId}
				onCardInView={handleCardInView}
			/>
		</div>
		<!-- Timeline overlay (above cards) -->
		<div class="absolute bottom-0 left-0 z-30 w-full">
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
	</style>
</svelte:head>

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
	<section class="relative flex flex-col w-full h-screen overflow-hidden" data-iframe-height={true}>
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
		<div
			class="sm:top-unset absolute left-0 top-[20svh] z-20 flex min-h-[20svh] w-full bg-transparent sm:left-auto sm:right-0 sm:bottom-0 sm:w-1/2"
		>
			<GazaCards
				bind:this={gazaCardsRef}
				{incidentsData}
				{selectedMarkerId}
				onCardInView={handleCardInView}
			/>
		</div>
		<!-- Timeline overlay (above cards) -->
		<div
			class="bottom-unset absolute left-0 top-[50svh] z-10 w-full sm:bottom-0 sm:top-auto sm:z-20"
		>
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

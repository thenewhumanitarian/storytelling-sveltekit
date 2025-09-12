<script lang="ts">
	import GazaMap from '$lib/components/gaza-map/GazaMap.svelte';
	import Timeline from '$lib/components/gaza-map/GazaTimeline.svelte';
	import GazaCards from '$lib/components/gaza-map/GazaCards.svelte';
	import { onMount } from 'svelte';

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
			// Clear previous selections first
			selectedMarkerId = null;
			highlightedMarkerId = null;
			// Then set the new selection
			selectedMarkerId = firstIncidentId;
		} else {
			// If clearing the week selection, also clear marker
			selectedMarkerId = null;
			highlightedMarkerId = null;
		}
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();

			const currentIndex = incidentsData.findIndex((item) => item.chronoId === selectedMarkerId);
			let newIndex: number;

			if (event.key === 'ArrowLeft') {
				// Go to previous
				newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
			} else {
				// Go to next
				newIndex =
					currentIndex < incidentsData.length - 1 ? currentIndex + 1 : incidentsData.length - 1;
			}

			const newId = incidentsData[newIndex].chronoId;
			handleCardInView(newId);

			// Scroll to the card
			if (gazaCardsRef && gazaCardsRef.scrollToCard) {
				gazaCardsRef.scrollToCard(newId);
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<main class="h-screen bg-white">
	<section class="flex h-full min-h-0 w-full flex-col">
		<div class="flex flex-grow flex-col">
			<div class="min-h-[120px] flex-grow">
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
			<div class="w-full flex-shrink-0">
				<GazaCards
					bind:this={gazaCardsRef}
					{incidentsData}
					{selectedMarkerId}
					onCardInView={handleCardInView}
				/>
			</div>
		</div>
		<div class="z-30 w-full flex-shrink-0">
			<Timeline
				{setHighlightedMarkerId}
				{highlightedMarkerId}
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
		}
		@media (max-width: 640px) {
			.map-container {
				min-height: 120px;
				height: 100%;
			}
		}
	</style>
</svelte:head>

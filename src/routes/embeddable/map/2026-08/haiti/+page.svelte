<script lang="ts">
	import HaitiMap from '$lib/components/haiti-map/HaitiMap.svelte';
	import Timeline from '$lib/components/haiti-map/HaitiTimeline.svelte';
	import HaitiCards from '$lib/components/haiti-map/HaitiCards.svelte';
	import { onMount } from 'svelte';
	import type { HaitiLang } from '$lib/components/haiti-map/copy';
	import { withActiveLanguage } from '$lib/components/haiti-map/copy';

	let { data } = $props();
	const { incidentsData, mapboxToken } = data;

	let lang = $state<HaitiLang>('en');
	let selectedMarkerId = $state<number | null>(null);
	let highlightedMarkerId = $state<number | null>(null);
	let selectedWeekStartDate = $state<Date | null>(null);

	const localizedIncidents = $derived(incidentsData.map((item) => withActiveLanguage(item, lang)));

	function setLang(next: HaitiLang) {
		lang = next;
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.set('lang', next);
		history.replaceState({}, '', url);
	}

	function setSelectedMarkerId(id: number | null) {
		selectedMarkerId = id;
	}
	function setHighlightedMarkerId(id: number | null) {
		highlightedMarkerId = id;
	}
	function setSelectedWeek(date: Date | null, firstIncidentId: number | null) {
		selectedWeekStartDate = date;
		if (date !== null) {
			selectedMarkerId = null;
			highlightedMarkerId = null;
			selectedMarkerId = firstIncidentId;
		} else {
			selectedMarkerId = null;
			highlightedMarkerId = null;
		}
	}

	let haitiMapRef = $state<{
		setSelectionOriginToClick: () => void;
		flyToMarkerByChronoId: (id: number) => void;
	} | null>(null);
	let haitiCardsRef = $state<{ scrollToCard: (id: number) => void } | null>(null);

	function handleCardInView(id: number) {
		setSelectedMarkerId(id);
		if (haitiMapRef && haitiMapRef.flyToMarkerByChronoId) {
			haitiMapRef.flyToMarkerByChronoId(id);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();

			const currentIndex = localizedIncidents.findIndex(
				(item) => item.chronoId === selectedMarkerId
			);
			let newIndex: number;

			if (event.key === 'ArrowLeft') {
				newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
			} else {
				newIndex =
					currentIndex < localizedIncidents.length - 1
						? currentIndex + 1
						: localizedIncidents.length - 1;
			}

			const newId = localizedIncidents[newIndex].chronoId;
			handleCardInView(newId);

			if (haitiCardsRef && haitiCardsRef.scrollToCard) {
				haitiCardsRef.scrollToCard(newId);
			}
		}
	}

	onMount(() => {
		const queryLang = new URLSearchParams(window.location.search).get('lang');
		if (queryLang === 'fr' || queryLang === 'en') {
			lang = queryLang;
		}
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<main class="h-screen bg-white">
	<section class="flex h-full min-h-0 w-full flex-col">
		<div class="flex grow flex-col">
			<div class="min-h-[120px] grow">
				<HaitiMap
					bind:this={haitiMapRef}
					{selectedMarkerId}
					{setSelectedMarkerId}
					{highlightedMarkerId}
					{setHighlightedMarkerId}
					incidentsData={localizedIncidents}
					{selectedWeekStartDate}
					{mapboxToken}
					{lang}
					{setLang}
				/>
			</div>
			<div class="w-full shrink-0">
				<HaitiCards
					bind:this={haitiCardsRef}
					incidentsData={localizedIncidents}
					{selectedMarkerId}
					onCardInView={handleCardInView}
					{lang}
				/>
			</div>
		</div>
		<div class="z-30 w-full shrink-0">
			<Timeline
				{setHighlightedMarkerId}
				{highlightedMarkerId}
				incidentsData={localizedIncidents}
				{haitiMapRef}
				{selectedWeekStartDate}
				{setSelectedWeek}
				{selectedMarkerId}
				scrollToCard={haitiCardsRef ? haitiCardsRef.scrollToCard : undefined}
				{lang}
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

<script lang="ts">
	import GazaMap from '$lib/components/GazaMap/GazaMap.svelte';
	import Timeline from '$lib/components/GazaMap/Timeline.svelte';
	import { gaza_incidents } from '$lib/components/GazaMap/incidents';

  let { data } = $props()

  console.log('data: ', data)

	// Shared state: ID of the selected incident
	let selectedMarkerId = $state<number | null>(null);
	let highlightedMarkerId = $state<number | null>(null);

	function setSelectedMarkerId(id: number | null) {
		selectedMarkerId = id;
	}
	function setHighlightedMarkerId(id: number | null) {
		highlightedMarkerId = id;
	}
</script>

<main data-iframe-height={true}></main>

<section class="relative flex h-screen w-full flex-col" data-iframe-height={true}>
	<div class="flex-grow">
		<!-- Map takes available space -->
		<GazaMap
			{selectedMarkerId}
			{setSelectedMarkerId}
			{highlightedMarkerId}
			{setHighlightedMarkerId}
      gaza_incidents={data.incidents_data}
		/>
	</div>
	<div class="absolute bottom-0 left-0 z-30 w-full">
		<!-- Timeline container -->
		<Timeline
			{selectedMarkerId}
			{setSelectedMarkerId}
			{highlightedMarkerId}
			{setHighlightedMarkerId}
      gaza_incidents={data.incidents_data}
		/>
	</div>
</section>

<svelte:head>
	<style>
		html,
		body {
			height: 100%;
			margin: 0;
		}
	</style>
</svelte:head>

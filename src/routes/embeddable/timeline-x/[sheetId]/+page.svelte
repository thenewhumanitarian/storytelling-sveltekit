<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '@knight-lab/timelinejs/dist/css/timeline.css';

	let timelineContainer: HTMLDivElement;
	let sheetId;

	$: sheetId = $page.params.sheetId; // Extract the sheetId from the URL

	onMount(() => {
		import('@knight-lab/timelinejs').then(({ Timeline }) => {
			const options = {
				initial_zoom: 3,
				timenav_position: 'bottom',
				font: 'Roboto',
				theme: 'timeline'
			};

			new Timeline(
				timelineContainer,
				`https://docs.google.com/spreadsheets/d/${sheetId}/pubhtml`, // Dynamically use the sheetId
				options
			);
		});
	});
</script>

<div id="timeline--wrapper" bind:this={timelineContainer}></div>

<style>
	#timeline--wrapper {
		aspect-ratio: 1/1;
	}

	@media screen and (max-width: 600px) {
		#timeline--wrapper {
			aspect-ratio: 1/2;
		}
	}
</style>

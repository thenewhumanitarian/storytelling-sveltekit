<script lang="ts">
	/**
	 * MapScrolly - Interactive map visualization for eviction locations
	 *
	 * Displays a MapTiler map with GeoJSON overlays showing eviction
	 * locations and demolished villages. Receives activeStep from parent
	 * ScrollySection and flies to appropriate locations.
	 */
	import { onMount, onDestroy } from 'svelte';

	// MapTiler API Key - TODO: Move to env variable
	const MAPTILER_API_KEY = 'RAt0tXJKfw0bbmg4ox00';

	interface Props {
		activeStep: number;
		fadeProgress?: number; // 0-1, controls fade-in overlay (1 = opaque, 0 = visible)
		fadeOutProgress?: number; // 0-1, controls fade-out overlay at end (0 = visible, 1 = opaque)
	}

	let { activeStep, fadeProgress = 0, fadeOutProgress = 0 }: Props = $props();

	// State
	let map: any = null;
	let mapContainer: HTMLDivElement | undefined = $state();
	let steps = $state<any[]>([]);
	let mapReady = $state(false);
	let mapError = $state<string | null>(null);
	let evictionsData: any = null;
	let villagesData: any = null;
	let checkSDKInterval: ReturnType<typeof setInterval> | null = null;

	// Track previous step to detect changes
	let prevStep = $state(-1);

	// Load narrative steps and GeoJSON data
	async function loadData() {
		try {
			const [narrativeRes, evictionsRes, villagesRes] = await Promise.all([
				fetch('/data/cleared/map-narrative.json'),
				fetch('/data/cleared/evictions.geojson'),
				fetch('/data/cleared/villages_demolished.geojson')
			]);

			const narrativeData = await narrativeRes.json();
			steps = narrativeData.steps;

			evictionsData = await evictionsRes.json();
			villagesData = await villagesRes.json();
		} catch (error) {
			console.error('Error loading map data:', error);
			mapError = 'Failed to load map data';
		}
	}

	async function initializeMap() {
		if (!window.maptilersdk || !mapContainer) {
			mapError = 'MapTiler SDK not loaded';
			return;
		}

		try {
			window.maptilersdk.config.apiKey = MAPTILER_API_KEY;

			const initialStep = steps[0] || {
				coordinates: [92.9376, 26.2006],
				zoom: 7,
				pitch: 0,
				bearing: 0
			};

			map = new window.maptilersdk.Map({
				container: mapContainer,
				style: `https://api.maptiler.com/maps/streets-v2-light/style.json?key=${MAPTILER_API_KEY}`,
				center: initialStep.coordinates,
				zoom: initialStep.zoom,
				pitch: initialStep.pitch,
				bearing: initialStep.bearing,
				interactive: false,
				scrollZoom: false,
				boxZoom: false,
				dragRotate: false,
				dragPan: false,
				keyboard: false,
				doubleClickZoom: false,
				touchZoomRotate: false,
				navigationControl: false,
				attributionControl: true
			});

			await map.onReadyAsync();
			addMapLayers();
			mapReady = true;

			// Fly to initial step if activeStep > 0
			if (activeStep > 0 && steps[activeStep]) {
				flyToStep(activeStep);
			}
		} catch (error) {
			console.error('Error initializing map:', error);
			mapError = 'Failed to initialize map';
		}
	}

	function addMapLayers() {
		if (!evictionsData || !villagesData || !map) return;

		// Add evictions source and layer
		map.addSource('evictions', {
			type: 'geojson',
			data: evictionsData
		});

		map.addLayer({
			id: 'evictions-circles',
			type: 'circle',
			source: 'evictions',
			paint: {
				'circle-radius': [
					'interpolate',
					['linear'],
					['get', 'people_evicted'],
					100, 5,
					5000, 12,
					15000, 22
				],
				'circle-color': '#9F3E52',
				'circle-opacity': 0.6,
				'circle-stroke-width': 1,
				'circle-stroke-color': '#1a1a1a',
				'circle-stroke-opacity': 0.2
			}
		});

		// Add villages source and layer (initially hidden)
		map.addSource('villages', {
			type: 'geojson',
			data: villagesData
		});

		map.addLayer({
			id: 'villages-circles',
			type: 'circle',
			source: 'villages',
			paint: {
				'circle-radius': [
					'interpolate',
					['linear'],
					['get', 'population_displaced'],
					100, 8,
					3000, 14,
					9000, 20
				],
				'circle-color': '#35B58B',
				'circle-opacity': 0,
				'circle-stroke-width': 2,
				'circle-stroke-color': '#1a1a1a',
				'circle-stroke-opacity': 0
			}
		});

		// Add village labels layer
		map.addLayer({
			id: 'villages-labels',
			type: 'symbol',
			source: 'villages',
			layout: {
				'text-field': ['get', 'name'],
				'text-size': 12,
				'text-offset': [0, 1.5],
				'text-anchor': 'top'
			},
			paint: {
				'text-color': '#1a1a1a',
				'text-halo-color': '#f5f0eb',
				'text-halo-width': 1,
				'text-opacity': 0
			}
		});
	}

	function updateLayerVisibility(stepIndex: number) {
		if (!map || !mapReady) return;

		const step = steps[stepIndex];
		if (!step?.layers) return;

		// Update evictions layer
		if (step.layers.evictions) {
			map.setPaintProperty(
				'evictions-circles',
				'circle-opacity',
				step.layers.evictions.opacity || 0.6
			);
		}

		// Update villages layer
		if (step.layers.villages) {
			const villageOpacity = step.layers.villages.visible ? (step.layers.villages.opacity || 1.0) : 0;
			map.setPaintProperty('villages-circles', 'circle-opacity', villageOpacity);
			map.setPaintProperty('villages-circles', 'circle-stroke-opacity', villageOpacity);
			map.setPaintProperty('villages-labels', 'text-opacity', villageOpacity > 0.5 ? 1 : 0);

			// Highlight effect for final step
			if (step.layers.villages.highlight) {
				map.setPaintProperty('villages-circles', 'circle-stroke-width', 3);
				map.setPaintProperty('villages-circles', 'circle-color', '#35B58B');
			} else {
				map.setPaintProperty('villages-circles', 'circle-stroke-width', 2);
			}
		}
	}

	function flyToStep(index: number) {
		if (!map || !mapReady) return;

		const step = steps[index];
		if (!step) return;

		map.flyTo({
			center: step.coordinates,
			zoom: step.zoom,
			bearing: step.bearing || 0,
			pitch: step.pitch || 0,
			duration: step.duration || 2000,
			easing: (t: number) => t * (2 - t)
		});

		updateLayerVisibility(index);
	}

	// Effect to fly to step when activeStep changes
	$effect(() => {
		if (mapReady && activeStep !== prevStep) {
			prevStep = activeStep;
			flyToStep(activeStep);
		}
	});

	onMount(async () => {
		await loadData();

		// Wait for SDK to be available with cleanup
		checkSDKInterval = setInterval(() => {
			if (window.maptilersdk) {
				if (checkSDKInterval) {
					clearInterval(checkSDKInterval);
					checkSDKInterval = null;
				}
				initializeMap();
			}
		}, 100);

		// Timeout after 10 seconds
		setTimeout(() => {
			if (checkSDKInterval) {
				clearInterval(checkSDKInterval);
				checkSDKInterval = null;
				if (!mapReady) {
					mapError = 'Map SDK failed to load';
				}
			}
		}, 10000);
	});

	onDestroy(() => {
		// Clean up interval if still running
		if (checkSDKInterval) {
			clearInterval(checkSDKInterval);
			checkSDKInterval = null;
		}
		// Clean up map
		if (map) {
			map.remove();
			map = null;
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://cdn.maptiler.com" />
	<link rel="dns-prefetch" href="https://cdn.maptiler.com" />
	<script src="https://cdn.maptiler.com/maptiler-sdk-js/v3.6.1/maptiler-sdk.umd.min.js"></script>
	<link href="https://cdn.maptiler.com/maptiler-sdk-js/v3.6.1/maptiler-sdk.css" rel="stylesheet" />
</svelte:head>

<div class="map-viz">
	<div class="map" bind:this={mapContainer}></div>

	{#if mapError}
		<div class="map-error">
			<p>{mapError}</p>
		</div>
	{:else if !mapReady}
		<div class="map-loading">
			<p>Loading map...</p>
		</div>
	{/if}

	{#if fadeProgress > 0 || fadeOutProgress > 0}
		<div class="fade-overlay" style:opacity={Math.max(fadeProgress, fadeOutProgress)}></div>
	{/if}
</div>

<style>
	.map-viz {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #f5f0eb;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	.map-loading,
	.map-error {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(245, 240, 235, 0.9);
	}

	.map-loading p,
	.map-error p {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1rem;
		color: rgba(0, 0, 0, 0.4);
	}

	.map-error p {
		color: #9f3e52;
	}

	.fade-overlay {
		position: absolute;
		inset: 0;
		background: #f5f0eb;
		pointer-events: none;
		z-index: 10;
	}
</style>

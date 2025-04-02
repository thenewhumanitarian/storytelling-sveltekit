<script lang="ts">
	//import { env } from '$env/dynamic/private'
	import mapboxgl from 'mapbox-gl';
	import { onMount } from 'svelte';
	import { gaza_incidents } from '$lib/components/GazaMap/incidents';
	const MAPBOX_TOKEN =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';

	let mapContainer: HTMLElement | undefined = $state();
	let mapLoaded = $state(false);
	let clickedCoordinates: any = $state(null);

	onMount(() => {
		mapboxgl.accessToken = MAPBOX_TOKEN;
		const map = new mapboxgl.Map({
			container: mapContainer!,
			style: 'mapbox://styles/tnh-storytelling/cm2zyeivu00su01qw4lvjbylv',
			center: [34.3, 31.5],
			zoom: 10,
			attributionControl: false
		});

		map.on('load', () => {
			mapLoaded = true;
			map.resize();

			// Add navigation controls
			map.addControl(new mapboxgl.NavigationControl());

			// Add markers for incidents
			gaza_incidents.forEach(({ latitude, longitude, title, description }) => {
				const marker = new mapboxgl.Marker()
					.setLngLat([longitude, latitude])
					.setPopup(
						new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${title}</h3>
              <p class="text-sm">${description}</p>
            </div>
          `)
					)
					.addTo(map);
			});
		});

		map.on('click', (event) => {
			clickedCoordinates = event.lngLat;
		});

		return () => map.remove(); // cleanup on component destroy
	});
</script>

<div bind:this={mapContainer} class="map-container"></div>

{#if clickedCoordinates}
	<div class="mt-4 rounded border bg-gray-100 p-2 text-sm">
		<strong>Clicked Coordinates:</strong>
		<span
			>Longitude: {clickedCoordinates.lng.toFixed(5)}, Latitude: {clickedCoordinates.lat.toFixed(
				5
			)}</span
		>
	</div>
{/if}

<style>
	.map-container {
		aspect-ratio: 4/3;
		width: 100%;
	}

	:global(.mapboxgl-popup-content) {
		background-color: #ffffff;
		color: #333;
		border-radius: 0;
		padding: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	@media (width <= 500px) {
		:global(.mapboxgl-popup-content) {
			display: none;
		}

		:global(.mapboxgl-popup-tip) {
			display: none;
		}
	}

	:global(.mapboxgl-marker) {
		display: none;
	}

	:global(.custom-marker) {
		display: block;
		background-size: cover;
		background-position: center;
		border-radius: 50%;
		border: 0.3rem solid white;
		width: 5rem;
		height: 5rem;
		cursor: pointer;
		background-size: center; /* Larger background size for smooth animation */
		animation: borderPulse 5s ease-in-out infinite; /* Infinite animation for border colour change */
		will-change: border-color; /* Optimise for smoother animation */
	}

	@media (max-width: 500px) {
		:global(.custom-marker) {
			width: 3rem;
			height: 3rem;
		}
	}

	:global(.custom-marker:hover) {
		animation: none;
		z-index: 9999;
	}

	/* Adding slight delays to each marker */
	:global(.marker-0) {
		animation-delay: 0.5s;
	}

	:global(.marker-1) {
		animation-delay: 0.2s;
	}

	:global(.marker-2) {
		animation-delay: 0.1s;
	}

	:global(.marker-3) {
		animation-delay: 0.34s;
	}

	:global(.marker-4) {
		animation-delay: 0.3;
	}

	@keyframes borderPulse {
		0% {
			border-color: #9f3e52;
		}
		50% {
			border-color: #f2b0b8; /* Lighter shade */
		}
		100% {
			border-color: #9f3e52;
		}
	}

	:global(.mapboxgl-popup-close-button) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		font-size: 1.6rem;
		color: #9f3e52;
		padding: 0;
		top: 0.1rem;
		right: 0.2rem;
	}

	:global(.mapboxgl-popup-close-button:hover) {
		background-color: transparent;
		color: black;
	}

	:global(.mapboxgl-popup-close-button:focus-visible) {
		outline: none;
	}

	:global(.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip) {
		margin-top: -1px;
	}
</style>

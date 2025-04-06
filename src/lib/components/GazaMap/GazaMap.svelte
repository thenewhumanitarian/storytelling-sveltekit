<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount } from 'svelte';
	import { gaza_incidents } from '$lib/components/GazaMap/incidents';

	// Use public token (replace if necessary, ideally from env vars)
	const MAPBOX_TOKEN =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';

	const DEFAULT_MAP_ZOOM = 10;
	const ZOOM_ZOOM = 13;

	// --- Props ---
	let {
		selectedMarkerId,
		highlightedMarkerId,
		setSelectedMarkerId,
		setHighlightedMarkerId
	}: {
		selectedMarkerId: number | null;
		highlightedMarkerId: number | null;
		setSelectedMarkerId: (id: number | null) => void;
		setHighlightedMarkerId: (id: number | null) => void;
	} = $props();

	// --- Internal State ---
	let mapContainer: HTMLElement | undefined = $state();
	let map: mapboxgl.Map | null = $state(null); // Make map instance reactive state
	let markers = $state<{ id: number; markerInstance: mapboxgl.Marker }[]>([]);
	let clickedCoordinates: mapboxgl.LngLat | null = $state(null);

	// --- Lifecycle: Map Initialization ---
	onMount(() => {
		mapboxgl.accessToken = MAPBOX_TOKEN;
		const mapInstance = new mapboxgl.Map({
			container: mapContainer!,
			style: 'mapbox://styles/tnh-storytelling/cm2zyeivu00su01qw4lvjbylv',
			center: [34.3, 31.5],
			zoom: DEFAULT_MAP_ZOOM,
			attributionControl: false
		});
		map = mapInstance; // Assign to reactive state variable

		map.on('load', () => {
			map?.resize();
			map?.addControl(new mapboxgl.NavigationControl());

			const newMarkers: { id: number; markerInstance: mapboxgl.Marker }[] = [];
			gaza_incidents.forEach((incident, idx) => {
				const { id, latitude, longitude, title, description, killedOrWounded } = incident;
				const el = document.createElement('div');
				// Keep custom marker classes for CSS animation/styling not easily done w/ Tailwind
				el.className = `custom-marker marker-${idx}`;

				const popup = new mapboxgl.Popup({
					className: 'mapbox-popup-custom shadow-lg rounded-none',
					closeButton: false
				}) // Add base classes, remove default close button for custom one
					.setHTML(`
                        <div class="p-2.5 text-gray-700"> <!-- Tailwind popup content -->
                          <button class="mapboxgl-popup-close-button" type="button" aria-label="Close popup">×</button> <!-- Keep custom styled button -->
                          <h3 class="font-bold mb-1">${title}</h3>
                          <h5 class="text-sm font-semibold mb-1">${killedOrWounded} killed/wounded</h5>
                          <p class="text-sm">${description}</p>
                        </div>
                      `);

				const marker = new mapboxgl.Marker({ element: el })
					.setLngLat([longitude, latitude])
					.setPopup(popup)
					.addTo(map!);

				// Event listeners on the marker element
				el.addEventListener('mouseenter', () => setHighlightedMarkerId(id));
				el.addEventListener('mouseleave', () => setHighlightedMarkerId(null));
				el.addEventListener('click', () => {
					setSelectedMarkerId(id);
					// Optional: Fly to marker on click
					map?.flyTo({ center: [longitude, latitude], zoom: ZOOM_ZOOM });
				});
				// Add listener to popup close button
				popup.on('open', () => {
					const closeButton = popup.getElement()?.querySelector('.mapboxgl-popup-close-button');
					closeButton?.addEventListener('click', () => {
						popup.remove();
						setSelectedMarkerId(null);
						map?.flyTo({ zoom: DEFAULT_MAP_ZOOM });
					});
				});

				newMarkers.push({ id, markerInstance: marker });
			});
			markers = newMarkers; // Update the reactive markers array
		});

		map.on('click', (event) => {
			// Check if the click target is part of our custom marker
			let targetElement = event.originalEvent.target as HTMLElement;
			let isMarkerClick = false;
			while (targetElement && targetElement !== map?.getContainer()) {
				if (targetElement.classList.contains('custom-marker')) {
					isMarkerClick = true;
					break;
				}
				targetElement = targetElement.parentElement!;
			}

			if (!isMarkerClick) {
				clickedCoordinates = event.lngLat;
				map?.flyTo({ zoom: DEFAULT_MAP_ZOOM });
				markers.forEach(
					(m) => m.markerInstance.getPopup()?.isOpen() && m.markerInstance.togglePopup()
				);
				setSelectedMarkerId(null);
			}
		});

		// Cleanup on component destroy
		return () => {
			map?.remove();
			map = null;
			markers = [];
		};
	});

	// --- Effect: React to selectedMarkerId changes ---
	$effect(() => {
		// Get the current value (needed inside $effect)
		const currentHighlightId = highlightedMarkerId;
		const currentSelectedId = selectedMarkerId;
		const currentMarkers = markers;

		// This effect runs when `selectedMarkerId`, `highlightedMarkerId` or `markers` changes
		currentMarkers.forEach(({ id, markerInstance }) => {
			const element = markerInstance.getElement();
			if (!element) return;

			if (id === currentSelectedId) {
				if (!markerInstance.getPopup()?.isOpen()) {
					markerInstance.togglePopup();
					const coords = markerInstance.getLngLat();
					map?.flyTo({ center: [coords.lng, coords.lat], zoom: ZOOM_ZOOM });
				}
			}

			if (id === currentHighlightId) {
				element.classList.add('highlighted');
			} else {
				element.classList.remove('highlighted');
			}
		});
	});
</script>

<div bind:this={mapContainer} class="map-container h-full w-full"></div>

{#if clickedCoordinates}
	<div class="absolute left-0 top-0 z-10 ml-4 mt-4 rounded border bg-gray-100/90 p-2 text-sm">
		<strong>Clicked:</strong>
		<span class="ml-1">Lng: {clickedCoordinates.lng.toFixed(4)},</span>
		<span class="ml-1">Lat: {clickedCoordinates.lat.toFixed(4)}</span>
	</div>
{/if}

<style>
	.map-container {
		/* aspect-ratio: 16/8; */ /* Removed in favour of flex layout in parent */
		/* width: 100%; */ /* Handled by Tailwind */
		min-height: 300px; /* Ensure minimum map height */
	}

	/* Keep custom popup styling if needed, or rely on Tailwind in setHTML */
	:global(.mapbox-popup-custom .mapboxgl-popup-content) {
		/* Overriding mapbox defaults if needed, e.g., removing padding if handled by inner div */
		padding: 0;
		background-color: white; /* Ensure background */
		border-radius: 0px; /* Override mapbox default */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Custom shadow if needed */
		/* Tailwind handled color, border-radius, padding, shadow in setHTML/popup options */
	}

	/* Hide popup on mobile - still using media query + Mapbox class */
	@media (width <= 640px) {
		/* Using sm breakpoint */
		:global(.mapbox-popup-custom) {
			/* Target outer custom class */
			display: none;
		}
	}

	/* Keep custom marker base style */
	:global(.custom-marker) {
		display: block;
		background-size: cover;
		background-position: center;
		border-radius: 50%;
		border: 0.3rem solid white;
		width: 1rem; /* Base size */
		height: 1rem;
		cursor: pointer;
		animation: borderPulse 5s ease-in-out infinite;
		will-change: border-color;
	}
	/* Highlight style for marker */
	:global(.custom-marker.highlighted) {
		/* Tailwind equivalent: ring-4 ring-pink-200 ring-opacity-80 z-[1000] */
		box-shadow: 0 0 0 3px rgba(242, 176, 184, 0.8);
		z-index: 1000 !important; /* Ensure it's above others */
		animation: none; /* Stop pulsing when highlighted */
	}

	/* Responsive marker size */
	@media (max-width: 640px) {
		/* sm breakpoint */
		:global(.custom-marker) {
			width: 1.5rem; /* Slightly larger on mobile */
			height: 1.5rem;
			border-width: 0.2rem;
		}
	}

	/* Keep hover effect */
	:global(.custom-marker:hover) {
		animation: none;
		z-index: 999; /* High z-index on hover */
	}

	/* Keep animation delays */
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
		animation-delay: 0.3s;
	}

	/* Keep keyframes */
	@keyframes borderPulse {
		0% {
			border-color: #9f3e52;
		}
		50% {
			border-color: #f2b0b8;
		}
		100% {
			border-color: #9f3e52;
		}
	}

	/* Keep custom close button style */
	:global(.mapboxgl-popup-close-button) {
		position: absolute; /* Position within the popup content div */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		font-size: 1.5rem;
		line-height: 1;
		color: #9f3e52;
		top: 0.25rem;
		right: 0.25rem;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}
	:global(.mapboxgl-popup-close-button:hover) {
		color: black;
	}
	:global(.mapboxgl-popup-close-button:focus-visible) {
		outline: 1px solid blue;
		outline-offset: 1px;
	}

	:global(.mapbox-popup-custom .mapboxgl-popup-tip) {
		display: none;
	}
</style>

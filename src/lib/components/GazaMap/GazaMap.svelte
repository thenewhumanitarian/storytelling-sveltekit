<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import GazaCards from '$lib/components/GazaMap/GazaCards.svelte';
	import type { IncidentData } from './types';

	const MAPBOX_TOKEN =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';

	const DEFAULT_MAP_ZOOM = 10;
	const ZOOM_ZOOM = 13;
	const MAPBOX_STYLE = 'mapbox://styles/tnh-storytelling/cm90vsdlu007x01s6ewpw0ha5';

	let {
		selectedMarkerId,
		highlightedMarkerId,
		setSelectedMarkerId,
		setHighlightedMarkerId,
		incidentsData
	}: {
		selectedMarkerId: number | null;
		highlightedMarkerId: number | null;
		setSelectedMarkerId: (id: number | null) => void;
		setHighlightedMarkerId: (id: number | null) => void;
		incidentsData: IncidentData[];
	} = $props();

	let mapContainer: HTMLElement | undefined = $state();
	let map: mapboxgl.Map | null = $state(null);
	let markers = $state<{ id: number; markerInstance: mapboxgl.Marker }[]>([]);
	let clickedCoordinates: mapboxgl.LngLat | null = $state(null);
	let cardsComponent: GazaCards | null = null;

	function closeAllPopups(exceptId: number | null = null) {
		markers.forEach(({ id, markerInstance }) => {
			const popup = markerInstance.getPopup();
			if (popup?.isOpen() && id !== exceptId) {
				popup.remove();
			}
		});
	}

	function scrollToIncidentCard(id: number) {
		cardsComponent?.scrollToCard(id);
	}

	onMount(() => {
		mapboxgl.accessToken = MAPBOX_TOKEN;
		const mapInstance = new mapboxgl.Map({
			container: mapContainer!,
			style: MAPBOX_STYLE,
			center: [34.3, 31.5],
			zoom: DEFAULT_MAP_ZOOM,
			attributionControl: false
		});
		map = mapInstance;

		map.on('load', () => {
			map?.resize();
			map?.addControl(new mapboxgl.NavigationControl());

			map?.addSource('countries', {
				type: 'vector',
				url: 'mapbox://mapbox.country-boundaries-v1'
			});
			map?.addSource('satellite', {
				type: 'raster',
				url: 'mapbox://mapbox.satellite',
				tileSize: 256
			});
			map?.addLayer({
				id: 'gaza-satellite',
				type: 'raster',
				source: 'satellite',
				filter: ['==', ['get', 'name_en'], 'Gaza'],
				paint: { 'raster-opacity': 0.5 }
			});
			map?.addLayer({
				id: 'country-mask',
				type: 'fill',
				source: 'countries',
				'source-layer': 'country_boundaries',
				filter: ['!=', ['get', 'name_en'], 'Gaza'],
				paint: { 'fill-color': '#000000', 'fill-opacity': 0.5 }
			});

			const newMarkers: { id: number; markerInstance: mapboxgl.Marker }[] = [];
			incidentsData.forEach((incident, idx) => {
				const { id, latitude, longitude, title, description, killedOrWounded } = incident;
				const el = document.createElement('div');
				el.className = `custom-marker marker-${idx}`;

				const popup = new mapboxgl.Popup({
					className: 'mapbox-popup-custom shadow-lg rounded-none',
					closeButton: false
				}).setHTML(`
						<div class="p-2.5 text-gray-700">
							<button class="mapboxgl-popup-close-button" type="button" aria-label="Close popup">×</button>
							<h3 class="font-bold mb-1">${title}</h3>
							<h5 class="text-sm font-semibold mb-1">${killedOrWounded} killed/wounded</h5>
							<p class="text-sm">${description}</p>
						</div>
					`);

				const marker = new mapboxgl.Marker({ element: el })
					.setLngLat([longitude, latitude])
					.setPopup(popup)
					.addTo(map!);

				el.addEventListener('mouseenter', () => setHighlightedMarkerId(id));
				el.addEventListener('mouseleave', () => setHighlightedMarkerId(null));
				el.addEventListener('click', () => {
					closeAllPopups(id);
					setSelectedMarkerId(id);
					scrollToIncidentCard(id);
					map?.flyTo({ center: [longitude, latitude], zoom: ZOOM_ZOOM });
				});

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
			markers = newMarkers;
		});

		map.on('click', (event) => {
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
				// markers.forEach(
				// 	(m) => m.markerInstance.getPopup()?.isOpen() && m.markerInstance.togglePopup()
				// );
				setSelectedMarkerId(null);
			}
		});

		return () => {
			map?.remove();
			map = null;
			markers = [];
		};
	});

	$effect(() => {
		const currentHighlightId = highlightedMarkerId;
		const currentSelectedId = selectedMarkerId;
		const currentMarkers = markers;

		currentMarkers.forEach(({ id, markerInstance }) => {
			const element = markerInstance.getElement();
			if (!element) return;

			if (id === currentSelectedId) {
				if (!markerInstance.getPopup()?.isOpen()) {
					closeAllPopups(id);
					// markerInstance.getPopup()?.addTo(map!);
					map?.flyTo({ center: markerInstance.getLngLat(), zoom: ZOOM_ZOOM });
					scrollToIncidentCard(id);
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

<div bind:this={mapContainer} class="map-container h-full w-1/2"></div>

<GazaCards
	bind:this={cardsComponent}
	incidentsData={incidentsData.sort((a, b) => a.date.localeCompare(b.date))}
	onCardInView={(id) => {
		const incident = incidentsData.find((i) => i.id === id);
		if (incident && map) {
			map.flyTo({ center: [incident.longitude, incident.latitude], zoom: ZOOM_ZOOM });
			setSelectedMarkerId(id);
		}
	}}
/>

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

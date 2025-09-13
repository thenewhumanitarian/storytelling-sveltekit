<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import GazaCards from '$lib/components/gaza-map/GazaCards.svelte';
	import type { IncidentData } from './types';
	import GazaOverlay from './GazaOverlay.svelte';

	const MAPBOX_TOKEN =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';
	const DEFAULT_MAP_ZOOM = 10;
	const ZOOM_ZOOM = 13;
	const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

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
		selectedWeekStartDate: Date | null;
	} = $props();

	let mapContainer: HTMLElement | undefined = $state();
	let map: mapboxgl.Map | null = $state(null);
	let markers = $state<{ id: number; markerInstance: mapboxgl.Marker }[]>([]);
	let clickedCoordinates: mapboxgl.LngLat | null = $state(null);
	let cardsComponent: GazaCards | null = null;
	let selectionOrigin: 'click' | 'scroll' | null = null;
	let lastMapCenter: { lng: number; lat: number } | null = $state(null);

	export function setSelectionOriginToClick() {
		selectionOrigin = 'click';
	}

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

	// Add derived for selected event
	const selectedEvent = $derived(() => {
		const selected = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		return selected && selected.type === 'event' ? selected : null;
	});

	// Only show overlay if the selected card is an event and is the top visible card
	const showEventOverlay = $derived(() => {
		const selected = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		return selected && selected.type === 'event';
	});

	export function flyToMarkerByChronoId(id: number) {
		const incident = incidentsData.find((i) => i.chronoId === id);
		if (
			incident &&
			incident.type === 'incident' &&
			typeof incident.latitude === 'number' &&
			typeof incident.longitude === 'number' &&
			!isNaN(incident.latitude) &&
			!isNaN(incident.longitude) &&
			map
		) {
			const newCenter = { lng: incident.longitude, lat: incident.latitude };

			// Check if we're going to the same location as before
			const isSameLocation =
				lastMapCenter &&
				Math.abs(lastMapCenter.lng - newCenter.lng) < 0.0001 &&
				Math.abs(lastMapCenter.lat - newCenter.lat) < 0.0001;

			if (isSameLocation) {
				// Same location - do a brief zoom out and back in for visual feedback
				map.flyTo({
					center: [newCenter.lng, newCenter.lat],
					zoom: ZOOM_ZOOM - 0.5,
					pitch: 45,
					bearing: -17.6,
					duration: 500
				});

				// Zoom back in after a short delay
				setTimeout(() => {
					if (map) {
						map.flyTo({
							center: [newCenter.lng, newCenter.lat],
							zoom: ZOOM_ZOOM,
							pitch: 45,
							bearing: -17.6,
							duration: 400
						});
					}
				}, 350);
			} else {
				// Different location - normal flyTo
				map.flyTo({
					center: [newCenter.lng, newCenter.lat],
					zoom: ZOOM_ZOOM,
					pitch: 45,
					bearing: -17.6
				});
			}

			// Update the last center position
			lastMapCenter = newCenter;
		}
	}

	onMount(() => {
		mapboxgl.accessToken = MAPBOX_TOKEN;
		const mapInstance = new mapboxgl.Map({
			container: mapContainer!,
			style: MAPBOX_STYLE,
			center: [34.3, 31.5],
			zoom: DEFAULT_MAP_ZOOM,
			pitch: 45, // Tilt the map for 3D effect (0-85 degrees)
			bearing: -17.6, // Rotate the map slightly for better perspective
			attributionControl: false
		});
		map = mapInstance;

		// --- SOLUTION: PREVENT SCROLL TRAP ON MOBILE ---
		// Check for mobile screen size (matches your CSS breakpoint)
		if (window.innerWidth <= 640) {
			// Disables one-finger map panning, allowing page scrolling.
			map.dragPan.disable();
			// Disables map zooming via scroll gestures.
			map.scrollZoom.disable();
		}
		// Note: Two-finger gestures (pinch-to-zoom/pan) are handled by
		// `touchZoomRotate`, which remains enabled by default.

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
				paint: { 'fill-color': '#000', 'fill-opacity': 0.5 }
			});

			// Add Gaza border using local GeoJSON file
			map?.addSource('gaza-boundaries', {
				type: 'geojson',
				data: '/src/lib/data/gaza-map/gaza-boundaries.geojson'
			});

			// Add prominent Gaza border
			map?.addLayer({
				id: 'gaza-border',
				type: 'line',
				source: 'gaza-boundaries',
				paint: {
					'line-color': '#9f3e52', // Burgundy color to match theme
					'line-width': 4,
					'line-opacity': 0.8,
					'line-dasharray': [1, 1]
				}
			});

			const newMarkers: { id: number; markerInstance: mapboxgl.Marker }[] = [];
			incidentsData.forEach((incident, idx) => {
				// Only render markers for incidents with valid coordinates
				if (
					incident.type !== 'incident' ||
					typeof incident.latitude !== 'number' ||
					typeof incident.longitude !== 'number' ||
					isNaN(incident.latitude) ||
					isNaN(incident.longitude)
				) {
					return;
				}
				const { chronoId, latitude, longitude, title, description, killedOrWounded } = incident;
				const lat = latitude as number;
				const lng = longitude as number;
				const el = document.createElement('div');
				el.className = `custom-marker marker-${idx}`;

				const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map!);

				el.addEventListener('mouseenter', () => setHighlightedMarkerId(chronoId));
				el.addEventListener('mouseleave', () => setHighlightedMarkerId(null));
				el.addEventListener('click', () => {
					selectionOrigin = 'click';
					setSelectedMarkerId(chronoId);
					scrollToIncidentCard(chronoId);
					map?.flyTo({
						center: [lng, lat],
						zoom: ZOOM_ZOOM,
						pitch: 45,
						bearing: -17.6
					});
				});

				newMarkers.push({ id: chronoId, markerInstance: marker });
			});
			markers = newMarkers;

			// --- Heat map layer --- //
			const heatmapGeoJSON = {
				type: 'FeatureCollection',
				features: incidentsData
					.filter(
						(incident) =>
							incident.type === 'incident' &&
							typeof incident.latitude === 'number' &&
							typeof incident.longitude === 'number' &&
							!isNaN(incident.latitude) &&
							!isNaN(incident.longitude)
					)
					.map((incident) => ({
						type: 'Feature',
						properties: {
							intensity: Math.pow(incident.killedOrWounded || 1, 0.8)
						},
						geometry: {
							type: 'Point',
							coordinates: [incident.longitude as number, incident.latitude as number]
						}
					}))
			};

			map?.addSource('incidents-heatmap', {
				type: 'geojson',
				// @ts-ignore
				data: heatmapGeoJSON
			});

			map?.addLayer({
				id: 'incidents-heatmap-layer',
				type: 'heatmap',
				source: 'incidents-heatmap',
				paint: {
					'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0.2, 10, 1, 50, 2],
					'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 20, 10, 50, 15, 80],
					'heatmap-color': [
						'interpolate',
						['linear'],
						['heatmap-density'],
						0,
						'rgba(255, 255, 255, 0)',
						0.1,
						'rgba(221, 221, 221, 0.2)',
						0.3,
						'rgba(240, 120, 30, 0.5)',
						0.5,
						'rgba(240, 120, 30, 0.7)',
						0.8,
						'rgba(160, 60, 80, 0.8)',
						0.9,
						'rgba(160, 60, 80, 1)',
						1,
						'rgba(160, 60, 80, 1)'
					],
					'heatmap-opacity': 0.6
				}
			});
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
				map?.flyTo({
					zoom: DEFAULT_MAP_ZOOM,
					pitch: 45,
					bearing: -17.6
				});
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
		const currentSelectedId = selectedMarkerId;
		const currentHighlightId = highlightedMarkerId;

		markers.forEach(({ id, markerInstance }) => {
			const element = markerInstance.getElement();
			if (!element) return;

			if (id === currentSelectedId) {
				element.style.display = 'block';
			} else {
				element.style.display = 'none';
			}

			if (id === currentSelectedId) {
				if (selectionOrigin === 'click') {
					scrollToIncidentCard(id);
				}
				selectionOrigin = null;
			}

			if (id === currentHighlightId) {
				element.classList.add('highlighted');
			} else {
				element.classList.remove('highlighted');
			}
		});
	});
</script>

<div class="map-container relative w-full sm:w-1/2">
	<div bind:this={mapContainer} class="map-background h-full w-full"></div>
	{#if showEventOverlay()}
		<GazaOverlay event={selectedEvent()} />
	{/if}
</div>

{#if clickedCoordinates}
	<div class="absolute left-0 top-0 z-10 ml-4 mt-4 rounded border bg-gray-100/90 p-2 text-sm">
		<strong>Clicked:</strong>
		<span class="ml-1">Lng: {clickedCoordinates.lng.toFixed(4)},</span>
		<span class="ml-1">Lat: {clickedCoordinates.lat.toFixed(4)}</span>
	</div>
{/if}

<style>
	.map-container {
		width: 50%;
		height: 100%;
		min-height: 120px;
		max-height: 100svh;
		flex-grow: 1;
	}

	@media (max-width: 640px) {
		.map-container {
			min-height: 120px;
			max-height: 100svh;
			height: 100%;
			width: 100%;
			flex-grow: 1;
			aspect-ratio: unset;
		}
	}

	:global(.mapbox-popup-custom .mapboxgl-popup-content) {
		display: none;
		padding: 0;
		background-color: white;
		border-radius: 0px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	@media (width <= 640px) {
		:global(.mapbox-popup-custom) {
			display: none;
		}
	}

	:global(.custom-marker) {
		display: block;
		background-size: cover;
		background-position: center;
		border-radius: 50%;
		border: 0.3rem solid white;
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		animation: borderPulse 5s ease-in-out infinite;
		will-change: border-color;
	}

	:global(.custom-marker.highlighted) {
		box-shadow: 0 0 0 3px rgba(242, 176, 184, 0.8);
		z-index: 1000 !important;
		animation: none;
	}

	@media (max-width: 640px) {
		:global(.custom-marker) {
			width: 1.5rem;
			height: 1.5rem;
			border-width: 0.2rem;
		}
	}

	:global(.custom-marker:hover) {
		animation: none;
		z-index: 999;
	}

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

	@keyframes borderPulse {
		0% {
			border-color: #fff;
		}
		50% {
			border-color: #f2b0b8;
		}
		100% {
			border-color: #fff;
		}
	}

	:global(.mapboxgl-popup-close-button) {
		position: absolute;
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

	/* Modern gradient background for map container */
	.map-background {
		background: linear-gradient(
			135deg,
			#c4677a 0%,
			#d47284 25%,
			#b85d70 50%,
			#cc6b7e 75%,
			#a55468 100%
		);
		background-size: 200% 200%;
		animation: gradientShift 12s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
</style>

<script lang="ts">
	import { onDestroy, setContext, onMount, tick } from 'svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import mapboxgl from 'mapbox-gl';

	interface MapData {
		mapStyle?: string;
		center: [number, number];
		zoom: number;
		markers: Array<{
			coords: [number, number];
			popup: {
				id: string;
				name: string;
				profession: string;
				text: string;
			};
		}>;
	}

	const { data, markerClickHandler } = $props() as {
		data: MapData;
		markerClickHandler: (popupData: {
			id: string;
			name: string;
			profession: string;
			text: string;
		}) => void;
	};

	// Use your Mapbox token here
	mapboxgl.accessToken =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';

	let map: mapboxgl.Map;

	onMount(async () => {
		// Wait for the DOM to update before initializing the map
		await tick();

		// Initialize the map
		map = new mapboxgl.Map({
			container: 'map',
			style: data.mapStyle || 'mapbox://styles/mapbox/streets-v12',
			center: data.center,
			zoom: data.zoom || 10,
			maxZoom: 8,
			minZoom: 6
		});

		map.on('load', () => {
			map.resize();

			// Add navigation controls
			map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

			// Add country boundaries and satellite layers (existing code)
			map.addSource('countries', {
				type: 'vector',
				url: 'mapbox://mapbox.country-boundaries-v1'
			});
			map.addSource('satellite', {
				type: 'raster',
				url: 'mapbox://mapbox.satellite',
				tileSize: 256
			});
			map.addLayer({
				id: 'syria-satellite',
				type: 'raster',
				source: 'satellite',
				filter: ['==', ['get', 'name_en'], 'Syria'],
				paint: {
					'raster-opacity': 1
				}
			});
			map.addLayer({
				id: 'country-mask',
				type: 'fill',
				source: 'countries',
				'source-layer': 'country_boundaries',
				filter: ['!=', ['get', 'name_en'], 'Syria'],
				paint: {
					'fill-color': '#000000',
					'fill-opacity': 0.5
				}
			});

			// Adding markers from data.markers
			data.markers.forEach((marker) => {
				const el = document.createElement('div');
				el.className = 'custom-marker';
				const mapMarker = new mapboxgl.Marker(el).setLngLat(marker.coords).addTo(map);

				const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
						<h3 class="mb-0 text-2xl">${marker.popup.name}</h3>
						<h4 class="mb-2 text-xl">${marker.popup.profession}</h4>
						<p>${marker.popup.text}</p>
					`);

				// Open the popup on marker click and notify the parent component
				mapMarker.setPopup(popup);
				mapMarker.getElement().addEventListener('click', () => {
					markerClickHandler && markerClickHandler(marker.popup);
				});

				// Listen for popup close and reset marker selection in the parent component
				popup.on('close', () => {
					markerClickHandler && markerClickHandler(null);
				});
			});
		});
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<!-- Map container -->
<div id="map" class="map-container w-full"></div>

<style>
	.map-container {
		aspect-ratio: 4/3;
		width: 100%;
	}

	:global(.mapboxgl-popup-content) {
		background-color: #ffffff;
		color: #333;
		border-radius: 10px;
		padding: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	:global(.mapboxgl-popup-close-button) {
		width: 20px;
		height: 20px;
		padding-top: 0.1rem;
		font-size: 1.55rem;
		padding-right: 0.3rem;
		color: #9f3e52;
	}

	:global(.custom-marker) {
		background-color: #9f3e52; /* Marker color */
		width: 25px;
		height: 25px;
		border-radius: 50%;
		cursor: pointer;
		border: 3px solid white;
		transition: transform 0.3s;
	}
</style>

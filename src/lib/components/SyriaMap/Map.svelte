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
				id: number;
				name: string;
				profession: string;
				text: string;
			};
		}>;
	}

	const flyToOptions = {
		zoom: 7, // Adjust zoom level as needed
		speed: 0.8,
		curve: 1.42,
		essential: true
	};

	let openPopupId = $state(-1);

	$effect(() => {
		markerClickHandler(openPopupId);
	});

	$effect(() => {
		if (selectedMarkerId !== -1 && selectedMarkerId !== openPopupId) {
			console.log('Map received new ID', selectedMarkerId);
			openPopupId = selectedMarkerId;

			const marker = data.markers.find((marker) => marker.popup.id === selectedMarkerId);

			// Close all popups
			for (const popup of document.querySelectorAll('.mapboxgl-popup')) {
				popup.remove();

				// Fit the map to the bounds
				map.fitBounds(new mapboxgl.LngLatBounds(syriaBounds), {
					padding: 20 // Optional padding around the bounds
				});
			}

			if (marker) {
				// Fly to the marker's location
				map.flyTo({
					...flyToOptions,
					center: marker.coords
				});

				const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
						<h3 class="mb-0 text-2xl">${marker.popup.name}</h3>
						<h4 class="mb-2 text-xl">${marker.popup.profession}</h4>
						<p>${marker.popup.text}</p>
					`);

				const mapMarker = new mapboxgl.Marker().setLngLat(marker.coords).addTo(map);
				mapMarker.setPopup(popup);
				popup.addTo(map);
			}
		}
	});

	const { data, markerClickHandler, selectedMarkerId } = $props() as {
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

	// Define the bounding box for Syria (southwest and northeast corners)
	const syriaBounds = [
		[35.628316, 32.311062], // southwest corner (lng, lat)
		[42.377731, 37.319319] // northeast corner (lng, lat)
	];

	// Function to calculate an expanded bounding box
	function expandBounds(bounds, marginPercent = 0.25) {
		const [sw, ne] = bounds;
		const lngOffset = (ne[0] - sw[0]) * marginPercent;
		const latOffset = (ne[1] - sw[1]) * marginPercent;

		const expandedSw = [sw[0] - lngOffset, sw[1] - latOffset];
		const expandedNe = [ne[0] + lngOffset, ne[1] + latOffset];

		return new mapboxgl.LngLatBounds(expandedSw, expandedNe);
	}

	const expandedSyriaBounds = expandBounds(syriaBounds, 0.05);
	// Function to calculate bounds based on a 15% margin from the center
	function calculateBounds(center: [number, number], marginPercent: number = 0.15) {
		const latOffset = marginPercent * 180; // Approximate margin based on degrees
		const lngOffset = marginPercent * 360;

		const southWest = [center[0] - lngOffset, center[1] - latOffset] as [number, number];
		const northEast = [center[0] + lngOffset, center[1] + latOffset] as [number, number];

		return new mapboxgl.LngLatBounds(southWest, northEast);
	}

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
			minZoom: 5,
			maxBounds: expandedSyriaBounds // Restrict panning to expanded Syria bounds
		});

		map.on('load', () => {
			map.resize();

			// Fit the map to the bounds
			map.fitBounds(new mapboxgl.LngLatBounds(syriaBounds), {
				padding: 20 // Optional padding around the bounds
			});

			map.scrollZoom.disable();

			// Add navigation controls
			map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

			// Add country boundaries and satellite layers (existing code)
			map.addSource('countries', {
				type: 'vector',
				url: 'mapbox://mapbox.country-boundaries-v1'
			});
			// Add the satellite layer
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
					'raster-opacity': 0.8
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
				el.className = 'custom-marker relative bg-gradient-to-br from-burgundy to-red-700';

				const mapMarker = new mapboxgl.Marker(el).setLngLat(marker.coords).addTo(map);

				const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
						<h3 class="mb-0 text-2xl">${marker.popup.name}</h3>
						<h4 class="mb-2 text-xl">${marker.popup.profession}</h4>
						<p>${marker.popup.text}</p>
					`);

				// Open the popup on marker click and notify the parent component
				mapMarker.setPopup(popup);
				mapMarker.getElement().addEventListener('click', () => {
					openPopupId = marker.popup.id;

					// Fly to the marker's location when clicked
					map.flyTo({
						...flyToOptions,
						center: marker.coords
					});
				});

				// Listen for popup close and reset marker selection in the parent component
				popup.on('close', (e) => {
					if (openPopupId === marker.popup.id) {
						openPopupId = -1;

						// Fit the map to the bounds
						map.fitBounds(new mapboxgl.LngLatBounds(syriaBounds), {
							padding: 20 // Optional padding around the bounds
						});
					}
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
		/* background-color: #9f3e52;  */
		width: 25px;
		height: 25px;
		border-radius: 50%;
		cursor: pointer;
		border: 3px solid white;
		/* z-index: 999; */
	}
</style>

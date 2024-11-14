<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

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
				avatarPhoto: string;
				slug: string;
			};
		}>;
	}

	const flyToOptions = {
		zoom: 7,
		speed: 0.6,
		curve: 1.42,
		essential: true
	};

	const { data, markerClickHandler, selectedMarkerId } = $props() as {
		data: MapData;
		markerClickHandler: (popupData: {
			id: string;
			name: string;
			profession: string;
			text: string;
		}) => void;
	};

	let openPopupId = $state(-1);

	$effect(() => {
		markerClickHandler(openPopupId);
	});

	$effect(() => {
		if (selectedMarkerId !== -1 && selectedMarkerId !== openPopupId) {
			openPopupId = selectedMarkerId;

			const marker = data.markers.find((marker) => marker.popup.id === selectedMarkerId);

			// Close all popups
			for (const popup of document.querySelectorAll('.mapboxgl-popup')) {
				popup.remove();

				// Fit the map to the bounds
				map.fitBounds(new mapboxgl.LngLatBounds(syriaBounds), {
					padding: { top: 10, right: 20, bottom: 60, left: 20 }
				});
			}

			if (marker) {
				// Fly to the marker's location
				map.flyTo({
					...flyToOptions,
					center: marker.coords
				});

				const popup = new mapboxgl.Popup({
					offset: { top: [0, 50], bottom: [0, -10], left: [10, 0], right: [-10, 0] }
				}).setHTML(`
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

	// Use your Mapbox token here
	mapboxgl.accessToken =
		'pk.eyJ1IjoidG5oLXN0b3J5dGVsbGluZyIsImEiOiJjbTJ6eTUxY3owZGRnMnhzamxsZ204aTJoIn0.ICvZ1B2TsaGmXj02wQ0apw';

	let map: mapboxgl.Map;
	let mapLoaded = false;

	// Define the bounding box for Syria (southwest and northeast corners)
	const syriaBounds: [[number, number], [number, number]] = [
		[35.628316, 32.311062], // southwest corner (lng, lat)
		[42.377731, 37.319319] // northeast corner (lng, lat)
	];

	// Function to calculate an expanded bounding box
	function expandBounds(bounds: [number, number][], marginPercent = 0.25) {
		const [sw, ne] = bounds;
		const lngOffset = (ne[0] - sw[0]) * marginPercent;
		const latOffset = (ne[1] - sw[1]) * marginPercent;

		const expandedSw: [number, number] = [sw[0] - lngOffset, sw[1] - latOffset];
		const expandedNe: [number, number] = [ne[0] + lngOffset, ne[1] + latOffset];

		return new mapboxgl.LngLatBounds([expandedSw, expandedNe]);
	}

	const expandedSyriaBounds = expandBounds(syriaBounds, 0.015);

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
			minZoom: 4.5,
			maxBounds: expandedSyriaBounds // Restrict panning to expanded Syria bounds
		});

		map.on('load', () => {
			mapLoaded = true;
			map.resize();

			// Fit the map to the bounds
			map.fitBounds(new mapboxgl.LngLatBounds(syriaBounds), {
				padding: { top: 10, right: 20, bottom: 60, left: 20 }
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
			// Adds satellite layer for Syria
			map.addLayer({
				id: 'syria-satellite',
				type: 'raster',
				source: 'satellite',
				filter: ['==', ['get', 'name_en'], 'Syria'],
				paint: {
					'raster-opacity': 0.8
				}
			});
			// Add the country boundaries layer
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

			// map.addSource('population', {
			// 	type: 'geojson',
			// 	data: GeoJSON
			// });

			// // Add heatmap layer
			// map.addLayer({
			// 	id: 'population-heat',
			// 	type: 'heatmap',
			// 	source: 'population',
			// 	maxzoom: 9,
			// 	paint: {
			// 		// Adjust the heatmap weight based on 'population' to increase visibility
			// 		'heatmap-weight': ['interpolate', ['linear'], ['get', 'population'], 0, 0, 1000, 1.5],

			// 		// Increase the heatmap intensity to make the heatmap more visible
			// 		'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 5],

			// 		// Change color ramp to green -> blue, with higher transparency at lower density
			// 		'heatmap-color': [
			// 			'interpolate',
			// 			['linear'],
			// 			['heatmap-density'],
			// 			0,
			// 			'rgba(0, 128, 0, 0)', // Transparent green for low density
			// 			0.2,
			// 			'rgb(34, 139, 34)', // Forest green
			// 			0.4,
			// 			'rgb(60, 179, 113)', // Medium sea green
			// 			0.6,
			// 			'rgb(0, 191, 255)', // Deep sky blue
			// 			0.8,
			// 			'rgb(30, 144, 255)', // Dodger blue
			// 			1,
			// 			'rgb(0, 0, 139)' // Dark blue
			// 		],

			// 		// Adjust the heatmap radius by zoom level to expand visible area
			// 		'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 9, 30],

			// 		// Control heatmap opacity to keep it more visible at higher zoom levels
			// 		'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.9, 9, 0.3]
			// 	}
			// });

			// Adding markers from data.markers

			data.markers.forEach((marker, i) => {
				const el = document.createElement('div');
				el.className = `custom-marker marker-${i}`;

				// Set the marker to display the avatar image
				el.style.backgroundImage = `url(/assets/syria-map/${marker.popup.avatarPhoto})`;

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
							padding: { top: 10, right: 20, bottom: 60, left: 20 }
						});
					}
				});
			});
		});
	});

	onDestroy(() => {
		if (map) map.remove();
	});

	// Reactive effect to handle opening the correct popup based on selectedMarkerId
	$effect(() => {
		if (mapLoaded && selectedMarkerId !== -1 && selectedMarkerId !== openPopupId) {
			const marker = data.markers.find((marker) => marker.popup.id === selectedMarkerId);
			if (marker) {
				openPopupId = selectedMarkerId;

				// Close all existing popups
				for (const popup of document.querySelectorAll('.mapboxgl-popup')) {
					popup.remove();
				}

				// Fly to the marker's location
				map.flyTo({
					...flyToOptions,
					center: marker.coords
				});

				// Open a new popup for the selected marker
				const popup = new mapboxgl.Popup({
					offset: { top: [0, 50], bottom: [0, -10], left: [10, 0], right: [-10, 0] }
				}).setHTML(`
					<h3 class="mb-0 text-2xl">${marker.popup.name}</h3>
					<h4 class="mb-2 text-xl">${marker.popup.profession}</h4>
					<p>${marker.popup.text}</p>
				`);
				popup.setLngLat(marker.coords).addTo(map);
			}
		}
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

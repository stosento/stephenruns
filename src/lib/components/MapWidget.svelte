<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { browser } from '$app/environment';

	export let apiKey: string;
	export let locations: Array<{
		name: string;
		latitude: number;
		longitude: number;
		radius: number;
		workoutType: 'RUN' | 'XC SKI';
	}>;
	export let height: string = '400px';
	export let onMarkerClick: (location: (typeof locations)[0]) => void;
	export let selectedLocation: (typeof locations)[0] | null;
	export let showRadius: boolean = false;

	let mapElement: HTMLElement;
	let map: google.maps.Map;
	let circles: google.maps.Circle[] = [];
	let bounds: google.maps.LatLngBounds;

	const workoutColors = {
		RUN: '#3B82F6', // blue-500
		'XC SKI': '#22C55E' // green-500
	};

	onMount(async () => {
		if (browser) {
			// Load Google Maps JavaScript API
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
			document.head.appendChild(script);

			script.onload = () => {
				initializeMap();
			};
		}
	});

	function initializeMap() {
		bounds = new google.maps.LatLngBounds();

		map = new google.maps.Map(mapElement, {
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [
				{
					featureType: 'poi',
					elementType: 'labels',
					stylers: [{ visibility: 'off' }]
				}
			]
		});

		// Clear existing circles
		circles.forEach((circle) => circle.setMap(null));
		circles = [];

		// Add circles for each location
		locations.forEach((location) => {
			const circleColor = workoutColors[location.workoutType];

			const circle = new google.maps.Circle({
				strokeColor: circleColor,
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: circleColor,
				fillOpacity: 0.35,
				map,
				center: { lat: location.latitude, lng: location.longitude },
				radius: location.radius
			});

			// Add click handler to the circle
			circle.addListener('click', () => {
				onMarkerClick(location);
			});

			circles.push(circle);
			bounds.extend(circle.getCenter()!);
		});

		// Fit the map to show all circles
		map.fitBounds(bounds);
	}

	afterUpdate(() => {
		if (map && selectedLocation) {
			const center = { lat: selectedLocation.latitude, lng: selectedLocation.longitude };
			map.panTo(center);
			map.setZoom(15);
		}
	});
</script>

<div bind:this={mapElement} style="height: {height};" class="w-full rounded-lg shadow-lg"></div>

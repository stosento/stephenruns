<script lang="ts">
    import { onMount } from 'svelte';
    import * as loader from '@googlemaps/js-api-loader';
    import type { Document } from '@contentful/rich-text-types';
    import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
    
    export let locations: Array<{
      name: string;
      latitude: number;
      longitude: number;
      description?: Document;
    }> = [];
    
    export let apiKey: string;
    export let height = '400px';
    export let onMarkerClick: (location: typeof locations[0]) => void = () => {};
    export let selectedLocation: typeof locations[0] | null = null;
    
    let mapElement: HTMLElement;
    let map: google.maps.Map;
    let markers: { [key: string]: google.maps.Marker } = {};
    let infoWindows: { [key: string]: google.maps.InfoWindow } = {};
    let activeInfoWindow: google.maps.InfoWindow | null = null;
    
    $: if (selectedLocation && map) {
      // Close previously open info window
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
      
      // Smoothly pan to the new location
      map.panTo({ lat: selectedLocation.latitude, lng: selectedLocation.longitude });
      
      // Smooth zoom animation
      const currentZoom = map.getZoom() || 12;
      const targetZoom = 15;
      
      if (currentZoom !== targetZoom) {
        smoothZoom(map, targetZoom, currentZoom);
      }
      
      // Open the selected location's info window
      const infoWindow = infoWindows[selectedLocation.name];
      const marker = markers[selectedLocation.name];
      if (infoWindow && marker) {
        infoWindow.open(map, marker);
        activeInfoWindow = infoWindow;
        
        // Optional: Add bounce animation to the selected marker
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 750); // Stop bouncing after 750ms
      }
    }
  
    // Smooth zoom animation function
    function smoothZoom(map: google.maps.Map, targetZoom: number, currentZoom: number) {
      if (currentZoom !== targetZoom) {
        const zoomChange = targetZoom > currentZoom ? 1 : -1;
        google.maps.event.addListenerOnce(map, 'zoom_changed', () => {
          setTimeout(() => {
            smoothZoom(map, targetZoom, currentZoom + zoomChange);
          }, 80);
        });
        map.setZoom(currentZoom + zoomChange);
      }
    }
  
    async function initMap() {
      const mapLoader = new loader.Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });
      
      try {
        const google = await mapLoader.load();
        
        // Calculate center point from all locations or default to a fallback
        const bounds = new google.maps.LatLngBounds();
        locations.forEach(location => {
          bounds.extend({ lat: location.latitude, lng: location.longitude });
        });
        
        map = new google.maps.Map(mapElement, {
          zoom: 12,
          center: bounds.getCenter(),
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          // Add smooth pan/zoom options
          gestureHandling: 'cooperative',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        });
        
        // Add markers for each location
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: location.name,
            animation: google.maps.Animation.DROP,
            // Optional: Custom marker style
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          });
          
          markers[location.name] = marker;
          
          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="info-window max-w-xs p-2">
                <h3 class="text-lg font-semibold mb-2">${location.name}</h3>
                ${location.description ? `
                  <div class="text-sm mb-2">
                    ${documentToHtmlString(location.description)}
                  </div>
                ` : ''}
              </div>
            `,
            maxWidth: 300
          });
          
          infoWindows[location.name] = infoWindow;
          
          marker.addListener('click', () => {
            onMarkerClick(location);
          });
        });
        
        // Add map click listener to close active info window
        map.addListener('click', () => {
          if (activeInfoWindow) {
            activeInfoWindow.close();
            activeInfoWindow = null;
          }
        });
        
        // Fit map to show all markers with padding
        if (locations.length > 1) {
          map.fitBounds(bounds, {
            padding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    }
    
    onMount(() => {
      if (locations.length > 0 && apiKey) {
        initMap();
      }
      
      return () => {
        // Cleanup markers and listeners when component is destroyed
        Object.values(markers).forEach(marker => marker.setMap(null));
        if (map) {
          google.maps.event.clearInstanceListeners(map);
        }
      };
    });
  </script>
  
  <div bind:this={mapElement} style="width: 100%; height: {height};" class="rounded-lg overflow-hidden shadow-lg" />
  
  <style>
    :global(.info-window h3) {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #1F2937;
    }
    
    :global(.info-window p) {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #4B5563;
    }
  </style>
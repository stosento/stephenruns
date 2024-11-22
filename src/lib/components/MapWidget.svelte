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
    
    let mapElement: HTMLElement;
    let map: google.maps.Map;
    let markers: google.maps.Marker[] = [];
    
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
          ]
        });
        
        // Add markers for each location
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: location.name,
            animation: google.maps.Animation.DROP
          });
          
          // Add info window for each marker
          if (location.description) {
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="info-window">
                  <h3>${location.name}</h3>
                  ${location.description ? documentToHtmlString(location.description) : ''}
                </div>
              `
            });
            
            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          }
          
          markers.push(marker);
        });
        
        // Fit map to show all markers
        if (locations.length > 1) {
          map.fitBounds(bounds);
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
        // Cleanup markers when component is destroyed
        markers.forEach(marker => marker.setMap(null));
      };
    });
  </script>
  
  <div bind:this={mapElement} style="width: 100%; height: {height};" />
  
  <style>
    div {
      border-radius: 8px;
      overflow: hidden;
    }
    
    :global(.info-window h3) {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    
    :global(.info-window p) {
      margin: 0;
      font-size: 14px;
    }
  </style>
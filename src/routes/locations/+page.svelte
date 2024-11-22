<script lang="ts">
    import MapWidget from '$lib/components/MapWidget.svelte';
    import RichTextRenderer from '$lib/components/RichTextRenderer.svelte';
    import { getRunLocations } from '$lib/api/contentful';
    import { onMount } from 'svelte';
    import type { RunLocation } from '$lib/api/contentful';
    
    let locations: Array<{
      name: string;
      latitude: number;
      longitude: number;
      description?: Document;
    }> = [];
    let loading = true;
    let error = null;
    
    onMount(async () => {
      try {
        const response = await getRunLocations();
        console.log('Raw API Response:', response);
        console.log('Type of response:', typeof response);
        console.log('Is Array?', Array.isArray(response));
  
        // Handle both array and object responses
        let itemsToProcess = Array.isArray(response) ? response : response.items || [response];
        console.log('Items to process:', itemsToProcess);
  
        // Transform the data
        locations = itemsToProcess.map(item => {
          const fields = item.fields || item;
          console.log('Processing item:', fields);
          
          return {
            name: fields.name,
            latitude: fields.location?.lat,
            longitude: fields.location?.lon,
            description: fields.description
          };
        });
        
        console.log('Final transformed locations:', locations);
        loading = false;
      } catch (e) {
        console.error('Detailed error:', e);
        error = e;
        loading = false;
      }
    });
  </script>
  
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <p>Loading locations...</p>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{error.message}</span>
      <pre class="mt-2 text-xs overflow-x-auto">
        Response Type: {typeof error.response}
        {JSON.stringify(error, null, 2)}
      </pre>
    </div>
  {:else}
    <div class="space-y-6">
      {#if locations.length === 0}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No locations found.</p>
        </div>
      {:else}
        <MapWidget 
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          {locations}
          height="500px"
        />
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each locations as location}
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-xl font-semibold mb-2">{location.name}</h3>
              {#if location.description}
                <RichTextRenderer document={location.description} />
              {/if}
              <p class="text-sm text-gray-600 mt-2">
                Coordinates: {location.latitude}, {location.longitude}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
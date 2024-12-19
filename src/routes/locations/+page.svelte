<script lang="ts">
  import MapWidget from '$lib/components/MapWidget.svelte';
  import RichTextRenderer from '$lib/components/RichTextRenderer.svelte';
  import { getRunLocations } from '$lib/api/contentful';
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  
  let locations: Array<{
    name: string;
    latitude: number;
    longitude: number;
    radius: number;  // Added radius field
    description?: Document;
  }> = [];
  let loading = true;
  let error = null;
  let selectedLocation: typeof locations[0] | null = null;
  
  function handleMarkerClick(location: typeof locations[0]) {
    selectedLocation = location;
    // Scroll the selected location card into view if on mobile
    const card = document.getElementById(`location-${location.name.replace(/\s+/g, '-')}`);
    if (card && window.innerWidth < 768) {
      card.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
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
          radius: fields.radius || 500,  // Default 500m radius if not specified
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

<Header />

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
<div class="container mx-auto px-4 py-8">
  {#if locations.length === 0}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>No locations found.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Map Section -->
      <div class="lg:col-span-2">
        <MapWidget 
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          locations={locations}
          height="600px"
          onMarkerClick={handleMarkerClick}
          selectedLocation={selectedLocation}
          showRadius={true}
        />
      </div>
      
      <!-- Locations List Section -->
      <div class="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
        {#each locations as location}
          <div 
            id="location-{location.name.replace(/\s+/g, '-')}"
            class="bg-white shadow rounded-lg p-6 transition-all duration-200 {selectedLocation?.name === location.name ? 'ring-2 ring-blue-500' : ''}"
            on:click={() => handleMarkerClick(location)}
          >
            <h3 class="text-xl font-semibold mb-2">{location.name}</h3>
            {#if location.description}
              <div class="prose prose-sm max-w-none">
                <RichTextRenderer document={location.description} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
{/if}

<style>
:global(.prose) {
  max-width: none;
}

:global(.prose p) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
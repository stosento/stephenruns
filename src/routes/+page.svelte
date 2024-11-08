<script lang="ts">
  import { onMount } from 'svelte';
  import { getCalendarEvents } from '$lib/api/googlecalendar';
  import { getContentByType } from '$lib/api/contentful';
  import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
  import type { Document } from '@contentful/rich-text-types';
  import Calendar from '$lib/components/Calendar.svelte';

  let events: any[] = [];
  let bio: any = null;
  let loading = true;

  // Function to render rich text content safely
  function renderRichText(document: Document): string {
      const options = {
          renderNode: {
              // You can add custom rendering for specific node types here
              // For example, custom rendering for assets, entries, etc.
          }
      };
      
      return documentToHtmlString(document, options);
  }

  onMount(async () => {
      try {
          const [eventsData, bioData] = await Promise.all([
              getCalendarEvents(
                  new Date().getFullYear(),
                  new Date().getMonth()
              ),
              getContentByType('bio')
          ]);

          console.log('eventsData: ', eventsData);

          events = eventsData;
          bio = bioData;
      } catch (error) {
          console.error('Error loading content:', error);
      } finally {
          loading = false;
      }
  });
</script>

<div class="container mx-auto px-4 py-8">
  {#if loading}
      <div class="text-center py-12">
          <p class="text-gray-600">Loading...</p>
      </div>
  {:else if bio}
      <!-- Bio Section -->
      <div class="mb-12">
          
        {#if bio.fields.image}
            <div class="mb-8 flex justify-center">
                <div class="w-full max-w-md sm:max-w-xs"> <!-- Adjusted size here -->
                    <img 
                        src={bio.fields.image.fields.file.url} 
                        alt="Profile"
                        class="w-full h-auto rounded-lg shadow-md object-cover"
                    />
                </div>
            </div>
        {/if}
          
          <!-- Rich Text Content -->
          <div class="max-w-3xl mx-auto prose">
              {@html renderRichText(bio.fields.content)}
          </div>
      </div>

      <!-- Calendar Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Running Calendar</h2>
        <Calendar {events} />
      </div>
  {:else}
      <div class="text-center py-12">
          <p class="text-red-600">Error loading bio content</p>
      </div>
  {/if}
</div>

<style>
  /* Base styles for rich text content */
  :global(.prose) {
      @apply text-gray-900 leading-relaxed;
  }
  
  :global(.prose p) {
      @apply mb-2;
      @apply mt-2;
  }
  
  :global(.prose h1) {
      @apply text-3xl font-bold mb-4;
  }
  
  :global(.prose h2) {
      @apply text-2xl font-bold mb-3;
  }
  
  :global(.prose h3) {
      @apply text-xl font-bold mb-2;
  }
  
  :global(.prose ul) {
      @apply list-disc pl-5 mb-4;
  }
  
  :global(.prose ol) {
      @apply list-decimal pl-5 mb-4;
  }
  
  :global(.prose li) {
      @apply mb-1;
  }
  
  :global(.prose a) {
      @apply text-blue-600 hover:text-blue-800 underline;
  }
  
  :global(.prose blockquote) {
      @apply border-l-4 border-gray-300 pl-4 italic my-4;
  }
</style>
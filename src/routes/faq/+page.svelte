<script lang="ts">
    import { onMount } from 'svelte';
    import { getCalendarEvents } from '$lib/api/googlecalendar';
    import { getContentByType } from '$lib/api/contentful';
    import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
    import { BLOCKS, MARKS } from '@contentful/rich-text-types';
    import type { Document } from '@contentful/rich-text-types';
    import Calendar from '$lib/components/Calendar.svelte';
      import Header from '$lib/components/Header.svelte';
  
    let events: any[] = [];
    let bio: any = null;
    let loading = true;
  
    // Function to render rich text content safely
    function renderRichText(document: Document): string {
    let imageCount = 0;
    let isProcessingImages = false;
    let imageBuffer = [];
  
    const options = {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const { file, title, description } = node.data.target.fields;
          if (file.contentType.startsWith('image/')) {
            imageCount++;
            const imageHtml = `
              <figure class="w-1/4 p-2 mb-2 mt-0">
                <img
                  src="${file.url}"
                  alt="${description || title || 'Content image'}"
                  class="w-full h-auto rounded-lg shadow-md"
                />
              </figure>
            `;
            
            if (!isProcessingImages) {
              isProcessingImages = true;
              imageBuffer = [imageHtml];
              return `<div class="flex flex-wrap justify-center -mx-2">${imageHtml}`;
            } else {
              isProcessingImages = false;
              return `${imageHtml}</div>`;
            }
          }
          return '';
        },
        [BLOCKS.PARAGRAPH]: (node, next) => {
          return `<p>${next(node.content)}</p>`;
        },
      },
      renderMark: {
        [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
        [MARKS.ITALIC]: (text) => `<em>${text}</em>`,
        [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
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
  
            events = eventsData;
            bio = bioData;
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            loading = false;
        }
    });
  </script>
  
  <Header />
  
  <div class="container mx-auto px-4 py-8">
    {#if loading}
        <div class="text-center py-12">
            <p class="text-gray-600">Loading...</p>
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
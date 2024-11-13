<script lang="ts">
    import { onMount } from 'svelte';
    import { getContentByType } from '$lib/api/contentful';
    import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
    import { BLOCKS, MARKS } from '@contentful/rich-text-types';
    import type { Document } from '@contentful/rich-text-types';
    import Header from '$lib/components/Header.svelte';
  
    let faqs: any[] = [];
    let loading = true;
  
    // Function to render rich text content safely
    function renderRichText(document: Document): string {
        const options = {
            renderNode: {
                [BLOCKS.PARAGRAPH]: (node, next) => {
                    return `<p class="mt-2">${next(node.content)}</p>`;
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
            const response = await getContentByType('faq');
            faqs = response.fields.items || [];
            console.log('FAQ content:', faqs);
            loading = false;
        } catch (error) {
            console.error('Error loading content:', error);
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
    {:else if faqs.length > 0}
        <div class="max-w-2xl mx-auto space-y-4">
            {#each faqs as faq}
                <div class="border rounded-lg overflow-hidden">
                    <details class="group">
                        <summary class="flex justify-between items-center p-4 cursor-pointer bg-white hover:bg-gray-50">
                            <h3 class="text-lg font-medium text-gray-900">
                                {faq.fields.question}
                            </h3>
                            <span class="ml-6 flex-shrink-0">
                                <svg class="w-6 h-6 group-open:rotate-180 transition-transform duration-200" 
                                     fill="none" 
                                     viewBox="0 0 24 24" 
                                     stroke="currentColor">
                                    <path stroke-linecap="round" 
                                          stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="px-4 pb-4 prose max-w-none">
                            {@html renderRichText(faq.fields.answer)}
                        </div>
                    </details>
                </div>
            {/each}
        </div>
    {:else}
        <div class="text-center py-12">
            <p class="text-red-600">No FAQ items found</p>
        </div>
    {/if}
</div>
  
<style>
    /* Base styles remain the same */
</style>
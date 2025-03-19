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
						const imageWidth = file.details?.image?.width || 800;
						const imageHeight = file.details?.image?.height || 600;
						const aspectRatio = imageHeight / imageWidth;
						
						const imageHtml = `
            <figure class="w-1/4 p-2 mb-2 mt-0">
              <div style="aspect-ratio: ${imageWidth}/${imageHeight};" class="bg-gray-100">
                <img
                  src="${file.url}"
                  alt="${description || title || 'Content image'}"
                  class="w-full h-auto rounded-lg shadow-md"
                  width="${imageWidth}"
                  height="${imageHeight}"
                  loading="lazy"
                />
              </div>
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
				}
			},
			renderMark: {
				[MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
				[MARKS.ITALIC]: (text) => `<em>${text}</em>`,
				[MARKS.UNDERLINE]: (text) => `<u>${text}</u>`
			}
		};

		return documentToHtmlString(document, options);
	}

	function appendEventType(events: any) {
		return events.map((event) => {
			const eventTitle = event.summary;
			const isRun = eventTitle.includes('Run');
			const eventType = isRun ? 'RUN' : 'XC_SKI';
			return {
				...event,
				eventType
			};
		});
	}

	onMount(async () => {
		try {
			const [eventsData, bioData] = await Promise.all([
				getCalendarEvents(new Date().getFullYear(), new Date().getMonth()),
				getContentByType('bio', true)
			]);

			events = appendEventType(eventsData);
			console.log('events: ', events);
			bio = bioData;
		} catch (error) {
			console.error('Error loading content:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<!-- Preconnect to content domains to speed up loading -->
	<link rel="preconnect" href="https://images.ctfassets.net">
	<link rel="preconnect" href="https://cdn.contentful.com">
	
	<!-- Prevent layout shifts with font display strategy -->
	<style>
		:root {
			font-display: optional;
		}
	</style>
</svelte:head>

<Header />

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="text-center py-12">
			<!-- Skeleton loading placeholders that match final content size -->
			<div class="max-w-4xl mx-auto prose">
				<div class="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-8 animate-pulse"></div>
				<div class="h-6 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
				<div class="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
				<div class="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
				<div class="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse"></div>
				<div class="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
				
				<!-- Image placeholder matches final content layout -->
				<div class="flex flex-wrap justify-center -mx-2 my-6">
					<div class="w-1/4 p-2">
						<div class="bg-gray-200 rounded-lg aspect-ratio-4/3 animate-pulse"></div>
					</div>
					<div class="w-1/4 p-2">
						<div class="bg-gray-200 rounded-lg aspect-ratio-4/3 animate-pulse"></div>
					</div>
				</div>
				
				<div class="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
				<div class="h-4 bg-gray-200 rounded w-5/6 mb-2 animate-pulse"></div>
				<div class="h-10 bg-gray-200 rounded w-1/2 mx-auto mt-8 mb-4 animate-pulse"></div>
			</div>
		</div>
	{:else if bio}
		<!-- Bio Section -->
		<div class="mb-12">
			<!-- Rich Text Content -->
			<div class="max-w-4xl mx-auto prose">
				{@html renderRichText(bio?.fields?.content)}
			</div>
		</div>

		<!-- Calendar Section -->
		<div class="mt-12" id="calendar">
			<Calendar {events} />
		</div>
	{:else}
		<div class="text-center py-12">
			<p class="text-red-600">Error loading bio content</p>
		</div>
	{/if}
</div>

<style>
	/* Base styles for rich text content with containment for better performance */
	:global(.prose) {
		@apply text-gray-900 leading-relaxed;
		contain: content;
		min-height: 200px;
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
	
	/* Handle aspect ratios for image containers */
	:global(.aspect-ratio-4\/3) {
		aspect-ratio: 4/3;
	}
	
	/* Prevent layout shifts from images */
	:global(img) {
		transform: translateZ(0); /* Force GPU acceleration */
	}
	
	/* Animation for smooth transitions */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	:global(.prose > *) {
		animation: fadeIn 0.3s ease-in-out;
	}
</style>
<script lang="ts">
    import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
    import type { Document } from '@contentful/rich-text-types';
    
    export let document: Document;
    
    $: html = documentToHtmlString(document);
  </script>
  
  <div class="rich-text">
    {@html html}
  </div>
  
  <style>
    .rich-text :global(h1) {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0.5em 0;
    }
    
    .rich-text :global(h2) {
      font-size: 1.3em;
      font-weight: bold;
      margin: 0.5em 0;
    }
    
    .rich-text :global(p) {
      margin: 0.5em 0;
    }
    
    .rich-text :global(ul), .rich-text :global(ol) {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }
    
    .rich-text :global(li) {
      margin: 0.25em 0;
    }
  </style>
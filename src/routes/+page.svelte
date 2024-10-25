<script lang="ts">
  import { onMount } from 'svelte';
  import { getCalendarEvents } from '$lib/api/googlecalendar';

  let events: any[] = [];
  let loading = true;

  onMount(async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    events = await getCalendarEvents(currentYear, currentMonth);
    loading = false;
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<h2>Calendar Events</h2>
{#if loading}
  <p>Loading events...</p>
{:else}
  <ul>
    {#each events as event}
      <li>{event.summary} - {new Date(event.start.dateTime || event.start.date).toLocaleString()}</li>
    {/each}
  </ul>
{/if}
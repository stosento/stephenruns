<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getCookie, setCookie } from '$lib/utils/cookies';

	export let events: any[] = [];

	const dispatch = createEventDispatcher();

	// Calendar state
	let currentDate = new Date();
	$: currentMonth = currentDate.getMonth();
	$: currentYear = currentDate.getFullYear();

	// Get today's date for highlighting
	const today = new Date();
	$: isToday = (day: number) =>
		today.getDate() === day &&
		today.getMonth() === currentMonth &&
		today.getFullYear() === currentYear;

	let participantName = '';
	let showNameInput = false;
	let currentEventForName: any = null;

	// Modal state
	let showModal = false;
	let selectedDate: number | null = null;
	let selectedEvents: any[] = [];

	// Calendar navigation
	function previousMonth() {
		currentDate = new Date(currentYear, currentMonth - 1);
	}

	function nextMonth() {
		currentDate = new Date(currentYear, currentMonth + 1);
	}

	// Calendar helpers
	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	// Generate calendar data
	$: calendarDays = Array.from(
		{ length: getDaysInMonth(currentYear, currentMonth) },
		(_, i) => i + 1
	);

	$: firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

	// Format date for comparison
	function formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	// Get events for a specific day
	function getEventsForDay(day: number): any[] {
		const targetDate = new Date(currentYear, currentMonth, day);
		return events.filter((event) => {
			const eventDate = new Date(event.start.dateTime || event.start.date);
			return formatDate(eventDate) === formatDate(targetDate);
		});
	}

	// Handle day click
	function handleDayClick(day: number) {
		const dayEvents = getEventsForDay(day);
		//TODO - Make a call to retrieve event from DATABASE
		if (dayEvents.length > 0) {
			selectedDate = day;
			selectedEvents = dayEvents;
			showModal = true;
		}
	}

	// Format event time
	function formatEventTime(event: any): string {
		if (event.start.dateTime) {
			const start = new Date(event.start.dateTime);
			const end = new Date(event.end.dateTime);
			return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
		}
		return 'All Day';
	}

	// Format time
	function formatTime(date: any): string {
		const start = new Date(date);
		return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	}

	// Month names for header
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Close modal when clicking outside
	function handleModalBackgroundClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			showModal = false;
		}
	}

	// Modify handleAddToEventClick to show name input
	function handleAddToEventClick(event: any) {
		currentEventForName = event;
		showNameInput = true;
	}

	// Add new function to handle name submission
	async function handleNameSubmit() {
		console.log('submitting name');
		if (!participantName.trim() || !currentEventForName) return;

		try {
			// Get userId from cookies as before
			let userId = getCookie('userId');
			console.log('userId: ', userId);
			if (!userId) {
				userId =
					Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
				console.log('generated: ', userId);
				setCookie('userId', userId, {
					path: '/',
					maxAge: 60 * 60 * 24 * 30,
					sameSite: 'lax'
				});
			}

			// Create or fetch event
			const eventResponse = await fetch(`/api/events/${currentEventForName.id}`);
			if (eventResponse.status === 404) {
				const createResponse = await fetch('/api/events', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: currentEventForName.id,
						name: currentEventForName.summary,
						date: currentEventForName.start,
						type: currentEventForName.eventType
					})
				});

				if (!createResponse.ok) {
					throw new Error('Failed to create event');
				}
			}

			// Add participant with name
			const participantResponse = await fetch(
				`/api/events/${currentEventForName.id}/participants`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						userId,
						name: participantName
					})
				}
			);

			if (!participantResponse.ok) {
				throw new Error('Failed to add participant to event');
			}

			// Reset state
			showNameInput = false;
			participantName = '';
			currentEventForName = null;

			// Optionally close modal or show success message
			// showModal = false;
		} catch (error) {
			console.error('Error handling event participation:', error);
			throw error;
		}
	}
</script>

<div id="calendar" class="bg-white rounded-lg shadow">
	<!-- Calendar Header -->
	<div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
		<div class="flex items-center">
			<button class="p-2 hover:bg-gray-100 rounded-full" on:click={previousMonth}> ← </button>
			<h2 class="mx-4 font-semibold text-gray-900">
				{monthNames[currentMonth]}
				{currentYear}
			</h2>
			<button class="p-2 hover:bg-gray-100 rounded-full" on:click={nextMonth}> → </button>
		</div>
	</div>

	<!-- Calendar Grid -->
	<div class="p-4">
		<!-- Week day headers -->
		<div class="grid grid-cols-7 gap-1 mb-2">
			{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
				<div class="text-center text-sm font-medium text-gray-500 py-2">
					{day}
				</div>
			{/each}
		</div>

		<!-- Calendar days -->
		<div class="grid grid-cols-7 gap-1">
			<!-- Empty cells for offset -->
			{#each Array(firstDayOffset) as _}
				<div class="aspect-square p-2 bg-gray-50"></div>
			{/each}

			<!-- Actual days -->
			{#each calendarDays as day}
				{@const dayEvents = getEventsForDay(day)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="aspect-square p-2 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors {isToday(
						day
					)
						? 'bg-green-50'
						: ''}"
					on:click={() => handleDayClick(day)}
				>
					<div class="text-sm mb-1 flex justify-between items-center">
						<span class={isToday(day) ? 'font-semibold' : ''}>{day}</span>
						{#if dayEvents.length > 0}
							<span class="w-2 h-2 rounded-full bg-blue-500"></span>
						{/if}
					</div>
					{#each dayEvents as event}
						<div
							class="text-xs p-1 mb-1 rounded truncate {event.eventType === 'RUN'
								? 'bg-blue-100 text-blue-800'
								: 'bg-green-100 text-green-800'}"
							title={event.summary}
						>
							{event.summary} - {event.start.dateTime
								? formatTime(event.start.dateTime)
								: 'All Day'}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
		on:click={handleModalBackgroundClick}
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
			on:click|stopPropagation
		>
			<!-- Modal Header - keep as is -->
			<div
				class="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white"
			>
				<h3 class="text-lg font-semibold text-gray-900">
					Events for {monthNames[currentMonth]}
					{selectedDate}
				</h3>
				<button
					class="text-gray-400 hover:text-gray-500 transition-colors"
					on:click={() => (showModal = false)}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Modal Content -->
			<div class="p-6 space-y-4">
				{#each selectedEvents as event}
					<div
						class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
					>
						<!-- Event details - keep existing markup -->
						<h4 class="text-lg font-semibold text-gray-900 mb-2">{event.summary}</h4>
						<div class="space-y-2 text-sm text-gray-600">
							<!-- Time -->
							<p class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{formatEventTime(event)}
							</p>

							<!-- Location if exists -->
							{#if event.location}
								<p class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									{event.location}
								</p>
							{/if}

							<!-- Description if exists -->
							{#if event.description}
								<p class="mt-3 text-gray-700 whitespace-pre-line">{event.description}</p>
							{/if}

							<!-- Name input and buttons -->
							{#if showNameInput && currentEventForName?.id === event.id}
								<div class="mt-4 space-y-3">
									<input
										type="text"
										bind:value={participantName}
										placeholder="Enter your name"
										class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
									<div class="flex gap-2">
										<button
											on:click={handleNameSubmit}
											class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
										>
											Submit
										</button>
										<button
											on:click={() => {
												showNameInput = false;
												participantName = '';
												currentEventForName = null;
											}}
											class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
										>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<button
									on:click={() => handleAddToEventClick(event)}
									class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								>
									{event.eventType === 'RUN' ? 'Add Me to Run' : 'Add me to Ski'}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

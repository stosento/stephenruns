// routes/api/events/+server.js
import { createEvent, getAllEvents } from '$lib/api/events';
import { json } from '@sveltejs/kit';
import { EventType } from '@prisma/client';

// Get all events
export async function GET() {
	try {
		const events = await getAllEvents();
		return json(events);
	} catch (error) {
		return json({ error: 'Failed to fetch events' }, { status: 500 });
	}
}

// Create new event
export async function POST({ request }) {
	try {
		const data = await request.json();
		console.log('data: ', data);

		// Validate event type
		if (!Object.values(EventType).includes(data.type)) {
			return json({ error: 'Invalid event type' }, { status: 400 });
		}

		// Convert date string to Date object
		const eventData = {
			...data,
			date: new Date(data.date.dateTime)
		};

		const newEvent = await createEvent(eventData);
		return json(newEvent, { status: 201 });
	} catch (error) {
		console.error('Error creating event:', error);
		return json({ error: 'Failed to create event' }, { status: 500 });
	}
}

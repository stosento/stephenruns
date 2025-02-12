import { getEvent } from '$lib/api/events';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	try {
		const event = await getEvent(params.id);
		if (!event) {
			return json({ error: 'Event not found' }, { status: 404 });
		}
		return json(event);
	} catch (error) {
		return json({ error: 'Failed to fetch event' }, { status: 500 });
	}
}

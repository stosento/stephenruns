import { json } from '@sveltejs/kit';
import { removeParticipantFromEvent } from '$lib/api/events';

export async function DELETE({ params, request }) {
	try {
		console.log('attempting to delete participant from event');

		// Extract the event ID and user ID from the URL path
		const url = new URL(request.url);
		const pathSegments = url.pathname.split('/');
		const eventId = pathSegments[3]; // events/:eventId/participants/:userId
		const userId = params.id; // This is actually the userId from the URL path

		console.log('eventId:', eventId);
		console.log('userId:', userId);

		const updatedEvent = await removeParticipantFromEvent(eventId, userId);
		return json(updatedEvent);
	} catch (error) {
		console.error('Error removing participant:', error);
		return json({ error: 'Failed to remove participant' }, { status: 500 });
	}
}

import { json } from '@sveltejs/kit';
import {
	getEventParticipants,
	addParticipantToEvent,
	removeParticipantFromEvent
} from '$lib/api/events';

export async function GET({ params }) {
	try {
		const participants = await getEventParticipants(params.id);
		return json(participants);
	} catch (error) {
		return json({ error: 'Failed to fetch participants' }, { status: 500 });
	}
}

export async function POST({ params, request }) {
	try {
		const { userId, name } = await request.json();
		const updatedEvent = await addParticipantToEvent(params.id, userId, name);
		return json(updatedEvent);
	} catch (error) {
		return json({ error: 'Failed to add participant' }, { status: 500 });
	}
}

export async function DELETE({ params, request }) {
	try {
		const { userId } = await request.json();
		const updatedEvent = await removeParticipantFromEvent(params.id, userId);
		return json(updatedEvent);
	} catch (error) {
		return json({ error: 'Failed to remove participant' }, { status: 500 });
	}
}

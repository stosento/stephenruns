import { json } from '@sveltejs/kit';
import { getRunParticipants, addParticipantToRun } from '$lib/api/runs';

export async function GET({ params }) {
  try {
    const participants = await getRunParticipants(params.id)
    return json(participants)
  } catch (error) {
    return json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

export async function POST({ params, request }) {
  try {
    const { userId } = await request.json()
    const updatedRun = await addParticipantToRun(params.id, userId)
    return json(updatedRun)
  } catch (error) {
    return json({ error: 'Failed to add participant' }, { status: 500 })
  }
}
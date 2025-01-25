// routes/api/runs/+server.js
import { getAllRuns, getRun, addParticipantToRun, getRunParticipants } from '$lib/api/runs'
import { json } from '@sveltejs/kit'

// Get all runs
export async function GET() {
  try {
    const runs = await getAllRuns()
    return json(runs)
  } catch (error) {
    return json({ error: 'Failed to fetch runs' }, { status: 500 })
  }
}
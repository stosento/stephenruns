export async function GET({ params }) {
    try {
      const run = await getRun(params.id)
      if (!run) {
        return json({ error: 'Run not found' }, { status: 404 })
      }
      return json(run)
    } catch (error) {
      return json({ error: 'Failed to fetch run' }, { status: 500 })
    }
  }
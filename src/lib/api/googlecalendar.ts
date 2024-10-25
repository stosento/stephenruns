export async function getCalendarEvents(year: number, month: number) {
  try {
    const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
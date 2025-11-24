import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const formatDate = (eventData: Event | string): string => {
  // Extract the dateTime string from the input
  let dateTimeString: string;
  
  if (typeof eventData === 'string') {
    dateTimeString = eventData;
  } else if (eventData && eventData.dateTime) {
    dateTimeString = eventData.dateTime;
  } else {
    throw new Error('Invalid input format. Expected an Event object or a date string.');
  }

  // Create a Date object from the ISO string
  const date = new Date(dateTimeString);
  
  // Get day of week
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Format date as MM/dd/yyyy
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  // Return the formatted date
  return `${dayOfWeek}, ${month}/${day}/${year}`;
};

export const POST: RequestHandler = async ({ request }) => {
  const { eventName, eventStart, actionType, participantName } = await request.json();
  
  // Get webhook URL from environment variable
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const eventDate = formatDate(eventStart);

  let message = '';
  if (actionType === 'ADD') {
    message = `🎉 **New Participant!** ${participantName} has joined: "${eventName} - ${eventDate}"`
  } else if (actionType === 'REMOVE') {
    message = `👋 **Participant Left!** ${participantName} has left: "${eventName} - ${eventDate}"`
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message
      })
    });
    
    return json({ success: true });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
};
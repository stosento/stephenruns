import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { eventName, participantName } = await request.json();
  
  // Get webhook URL from environment variable
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `🎉 **New Participant!** ${participantName} has joined: "${eventName}"`
      })
    });
    
    return json({ success: true });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
};
import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import { config, validateEnvVariables } from '$lib/server/env';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export async function GET({ url }) {
    try {
        // Validate environment variables first
        validateEnvVariables();

        const jwtClient = new google.auth.JWT(
            config.GOOGLE_CLIENT_EMAIL,
            undefined,
            config.GOOGLE_PRIVATE_KEY,
            SCOPES
        );

        // Verify authentication
        await jwtClient.authorize();

        const calendar = google.calendar({ version: 'v3', auth: jwtClient });

        const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(url.searchParams.get('month') || (new Date().getMonth()).toString());

        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year+1, month, 1).toISOString();

        console.log('Fetching calendar events with ID:', config.GOOGLE_CALENDAR_ID); // Debug log

        const response = await calendar.events.list({
            calendarId: config.GOOGLE_CALENDAR_ID,
            timeMin: startDate,
            timeMax: endDate,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const responseJson = json(response.data.items);

        console.log('Calendar events fetched:', responseJson); // Debug log

        return json(response.data.items);
    } catch (error) {
        console.error('Server Error Details:', {
            message: error.message,
            stack: error.stack,
            calendarId: config.GOOGLE_CALENDAR_ID
        });
        
        return json(
            { 
                error: 'Failed to fetch calendar events', 
                details: error.message 
            }, 
            { status: 500 }
        );
    }
}
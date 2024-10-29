import { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_CALENDAR_ID, CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } from '$env/static/private';

export const config = {
    GOOGLE_PRIVATE_KEY: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_CALENDAR_ID: GOOGLE_CALENDAR_ID,
    CONTENTFUL_SPACE_ID: CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: CONTENTFUL_ACCESS_TOKEN
};

export function validateEnvVariables() {
    const required = {
        GOOGLE_PRIVATE_KEY: config.GOOGLE_PRIVATE_KEY,
        GOOGLE_CLIENT_EMAIL: config.GOOGLE_CLIENT_EMAIL,
        GOOGLE_CALENDAR_ID: config.GOOGLE_CALENDAR_ID,
        CONTENTFUL_SPACE_ID: config.CONTENTFUL_SPACE_ID,
        CONTENTFUL_ACCESS_TOKEN: config.CONTENTFUL_ACCESS_TOKEN
    };

    for (const [key, value] of Object.entries(required)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
}
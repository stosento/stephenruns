import { json } from '@sveltejs/kit';
import { createClient } from 'contentful';
import { config, validateEnvVariables } from '$lib/server/env';

// Initialize Contentful client
function getContentfulClient() {
    validateEnvVariables();
    
    return createClient({
        space: config.CONTENTFUL_SPACE_ID,
        accessToken: config.CONTENTFUL_ACCESS_TOKEN,
    });
}

export async function GET({ url }) {
    try {
        const contentType = url.searchParams.get('type');
        const limit = url.searchParams.get('limit');
        
        if (!contentType) {
            return json(
                { error: 'Content type parameter is required' },
                { status: 400 }
            );
        }

        const client = getContentfulClient();

        const response = await client.getEntries({
            content_type: contentType,
            // If limit is 1, use it, otherwise don't set a limit to get all items
            ...(limit === '1' ? { limit: 1 } : {})
        });

        // If no items found, return 404
        if (response.items.length === 0) {
            return json(
                { error: `No content found for type: ${contentType}` },
                { status: 404 }
            );
        }

        // If limit is 1, return just the first item
        // Otherwise return all items
        if (limit === '1') {
            return json(response.items[0]);
        } else {
            return json(response.items);
        }

    } catch (error) {
        console.error('CMS Error Details:', {
            message: error.message,
            stack: error.stack,
            contentType: url.searchParams.get('type'),
            limit: url.searchParams.get('limit')
        });

        return json(
            {
                error: 'Failed to fetch CMS content',
                details: error.message
            },
            { status: 500 }
        );
    }
}
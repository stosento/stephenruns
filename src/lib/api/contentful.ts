import type { Document } from '@contentful/rich-text-types';

export interface ContentfulLocation {
  lat: number;
  lon: number;
}

export interface RunLocationFields {
  name: string;
  location: ContentfulLocation;
  description?: Document;
}

export interface RunLocationEntry {
  metadata: Record<string, unknown>;
  fields: RunLocationFields;
}

export async function getContentByType(contentType: string, returnSingle: boolean = false): Promise<RunLocationEntry | RunLocationEntry[]> {
    const url = new URL('/api/cms', window.location.origin);
    url.searchParams.set('type', contentType);
    if (returnSingle) {
        url.searchParams.set('limit', '1');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType} content`);
    }
    return response.json();
}

export async function getRunLocations(returnSingle: boolean = false): Promise<RunLocationEntry | RunLocationEntry[]> {
    return getContentByType('runLocation', returnSingle);
}
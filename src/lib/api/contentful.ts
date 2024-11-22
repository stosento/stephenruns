import type { Document } from '@contentful/rich-text-types';

export interface RunLocation {
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  description?: Document;
}

export async function getRunLocations(): Promise<RunLocation[]> {
  return getContentByType('runLocation');
}

export async function getContentByType(contentType: string) {
  const response = await fetch(`/api/cms?type=${contentType}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${contentType} content`);
  }
  return response.json();
}
export async function getContentByType(contentType: string) {
    const response = await fetch(`/api/cms?type=${contentType}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType} content`);
    }
    return response.json();
}
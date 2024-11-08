// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		// interface PageState {}
		interface Platform {}
	}
}

export {};

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    hangoutLink?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}
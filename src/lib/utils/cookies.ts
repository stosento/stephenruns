interface CookieOptions {
	path?: string;
	maxAge?: number;
	sameSite?: 'strict' | 'lax' | 'none';
}

export function getCookie(name: string): string | null {
	const matches = document.cookie.match(
		new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
	);
	return matches ? decodeURIComponent(matches[1]) : null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
	options = {
		path: '/',
		...options
	};

	if (options.maxAge) {
		options.maxAge = Math.floor(options.maxAge);
	}

	let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

	for (const [key, value] of Object.entries(options)) {
		updatedCookie += '; ' + key;
		if (value !== true) {
			updatedCookie += '=' + value;
		}
	}

	console.log('updatedCookie: ', updatedCookie);

	document.cookie = updatedCookie;
}

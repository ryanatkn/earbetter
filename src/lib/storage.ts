import {browser} from '$app/environment';

// TODO copypasted from dealt

/**
 * Loads `key` and falls back to `defaultValue`.
 * If `parse` is provided and throws, it removes the `key` and returns `undefined`.
 * @param key - The `localStorage` key.
 * @param defaultValue - Can be a lazily called function to avoid waste.
 * @param parse
 */
export const load_from_storage = <T>(
	key: string,
	default_value: T | (() => T),
	parse: (value: unknown) => T,
): T => {
	const fn = typeof default_value === 'function';
	console.log(`load_from_storage key`, key);
	if (!browser) return fn ? (default_value as any)() : default_value;
	const stored = localStorage.getItem(key);
	if (!stored) return fn ? (default_value as any)() : default_value;
	try {
		return parse(JSON.parse(stored));
	} catch (_err) {
		localStorage.removeItem(key);
		return fn ? (default_value as any)() : default_value;
	}
};

/**
 * Sets `value` at `key`.
 * Importantly, if `value` is `undefined` the `key` is removed,
 * but a `value` of `null` is stored.
 * @param key
 * @param value
 */
export const set_in_storage = (key: string, value: any): void => {
	if (!browser) return;
	if (value === undefined) {
		localStorage.removeItem(key);
	} else {
		console.log(`set_in_storage`, key, value);
		localStorage.setItem(key, JSON.stringify(value));
	}
};

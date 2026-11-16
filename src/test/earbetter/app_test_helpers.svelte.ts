import {flushSync} from 'svelte';

import {App} from '$lib/earbetter/app.svelte.js';
import type {Site_Data} from '$routes/site_data.js';
import {create_fake_audio_context} from '../test_helpers.js';

export const TEST_STORAGE_KEY = 'app';

export interface App_Harness {
	app: App;
	/**
	 * Tears down the app's effects.
	 */
	destroy: () => void;
}

/**
 * Creates an `App` inside an effect root, the way a component would own it,
 * and flushes its initial effects. Callers stub `localStorage` and mock `esm-env`
 * so storage behaves like the browser.
 */
export const create_app = (initial_site_data: Site_Data | null = null): App_Harness => {
	const {ac} = create_fake_audio_context();
	let app!: App;
	const destroy = $effect.root(() => {
		app = new App(() => ac, initial_site_data, TEST_STORAGE_KEY);
	});
	flushSync();
	return {app, destroy};
};

/**
 * Reads and parses a JSON value from `localStorage`.
 */
export const read_stored = (key: string): any => {
	const value = localStorage.getItem(key);
	return value === null ? null : JSON.parse(value);
};

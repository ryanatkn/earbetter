import { App } from '#lib/earbetter/app.svelte.ts';
import { create_fake_audio_context, type FakeAudioContext } from '../test_helpers.ts';

export const TEST_STORAGE_KEY = 'app';
export const TEST_SITE_STORAGE_KEY = 'site';

/**
 * Creates an `App` with a fake audio context.
 * `App` saves on write, so it owns no effects and needs no root or teardown.
 * Callers stub `localStorage` and mock `esm-env` so storage behaves like the browser.
 */
export const create_app = (audio: FakeAudioContext = create_fake_audio_context()): App => {
	return new App(() => audio.ac, {
		storage_key: TEST_STORAGE_KEY,
		site_storage_key: TEST_SITE_STORAGE_KEY
	});
};

/**
 * Reads and parses a JSON value from `localStorage`.
 */
export const read_stored = (key: string): any => {
	const value = localStorage.getItem(key);
	return value === null ? null : JSON.parse(value);
};

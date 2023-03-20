import {writable, type Writable} from 'svelte/store';

import type {MIDIAccess} from '$lib/audio/WebMIDI';
import {request_midi_access} from '$lib/audio/midi_helpers';

/** global store holding the result of `navigator.requestMIDIAccess` */
export const midi_access: Writable<MIDIAccess | null> = writable(null);

let inited: Promise<void> | undefined;

/**
 * `request_access` is globally idempotent so
 * components don't have to worry about colliding with each other.
 */
export const request_access = async (): Promise<void> => {
	if (inited) return inited;
	let resolve!: () => void;
	inited = new Promise((r) => (resolve = r));
	try {
		const value = await request_midi_access();
		midi_access.set(value);
		console.log('requested midi_access', value);
	} catch (err) {
		console.error('request_access failed', err);
		alert('Failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
	}
	resolve();
	return inited;
};

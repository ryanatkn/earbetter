import {type Signal, signal} from '@preact/signals-core';

import type {MIDIAccess} from '$lib/audio/WebMIDI';
import {request_midi_access} from '$lib/audio/midi_helpers';

/** global store holding the result of `navigator.requestMIDIAccess` */
export const midi_access: Signal<MIDIAccess | null> = signal(null);

let requesting = false;

export const request_access = async (): Promise<void> => {
	if (midi_access.peek() || requesting) return;
	requesting = true;
	try {
		const value = await request_midi_access();
		midi_access.value = value;
		console.log('requested midi_access', value);
	} catch (err) {
		console.error('request_access failed', err);
	}
	requesting = false;
};

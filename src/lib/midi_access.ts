import {type Signal, signal} from '@preact/signals-core';

import type {MIDIAccess} from '$lib/WebMIDI.js';
import {request_midi_access} from '$lib/midi_helpers.js';

// TODO handle disconnections

// TODO @multiple source from `audio` in context
/**
 * Holds the result of `navigator.requestMIDIAccess`.
 */
export const midi_access: Signal<MIDIAccess | null> = signal(null);

let requesting: Promise<MIDIAccess | null> | undefined;

// TODO @multiple source from `audio` in context, delete this or heavily refactor
export const reset_midi_access = (): void => {
	requesting = undefined;
	midi_access.value = null;
};

export const request_access = (): Promise<MIDIAccess | null> =>
	midi_access.peek()
		? Promise.resolve(midi_access.peek())
		: requesting ||
			(requesting = request_midi_access().then(
				(value) => {
					console.log('request_access midi_access', value);
					midi_access.value = value;
					return value;
				},
				(err) => {
					console.error('request_access failed', err);
					return null;
				},
			));

import type {MIDIAccess} from '$lib/WebMIDI.js';
import {request_midi_access} from '$lib/midi_helpers.js';

// TODO handle disconnections

let requesting: Promise<MIDIAccess | null> | undefined;

// TODO @many source from `audio` in context, delete this or heavily refactor
export const reset_midi_access = (state: {midi_access: MIDIAccess | null}): void => {
	console.log('resetting midi_access');
	requesting = undefined;
	state.midi_access = null;
};

// TODO @many source from `audio` in context, this is convoluted for race conditions, probably doesn't need to be
export const request_access = async (state: {
	midi_access: MIDIAccess | null;
}): Promise<MIDIAccess | null> => {
	const existing = state.midi_access;
	if (existing) {
		return existing;
	}
	if (requesting) {
		return requesting;
	}
	const r = request_midi_access();
	requesting = r;
	console.log('request_access midi_access', r);
	try {
		const value = await r;
		if (r !== requesting) {
			return requesting; // eslint-disable-line @typescript-eslint/return-await
		}
		state.midi_access = value;
		return value;
	} catch (err) {
		console.error('request_access failed', err);
		return requesting;
	}
};

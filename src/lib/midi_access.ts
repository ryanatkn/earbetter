import { request_midi_access } from './midi_helpers.ts';

let requesting: Promise<MIDIAccess | null> | undefined;

// TODO @many source from `audio` in context, delete this or heavily refactor
export const reset_midi_access = (state: { midi_access: MIDIAccess | null }): void => {
	requesting = undefined;
	state.midi_access = null;
};

// TODO @many source from `audio` in context, this is convoluted for race conditions, probably doesn't need to be
/**
 * Requests MIDI access once, sharing the pending request between callers.
 * A failed request rejects and is forgotten so the next call retries.
 */
export const request_access = async (
	state: {
		midi_access: MIDIAccess | null;
	},
	request: () => Promise<MIDIAccess> = request_midi_access
): Promise<MIDIAccess | null> => {
	const existing = state.midi_access;
	if (existing) {
		return existing;
	}
	if (requesting) {
		return requesting;
	}
	const r = request();
	requesting = r;
	try {
		const value = await r;
		if (r !== requesting) {
			return requesting; // eslint-disable-line @typescript-eslint/return-await
		}
		state.midi_access = value;
		return value;
	} catch (err) {
		if (r !== requesting) {
			return requesting;
		}
		requesting = undefined; // forget the failure so the next call retries
		throw err;
	}
};

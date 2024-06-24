import type {
	MIDICommand,
	MIDIMessageEvent,
	MIDIOptions,
	MIDIAccess,
	MIDIChannel,
	requestMIDIAccess,
} from '$lib/WebMIDI';
import type {Midi} from '$lib/music.js';

// WebMIDI helpers specific to cosmicplayground

export type MidiMessage = {
	command: MIDICommand;
	channel: MIDIChannel;
	note: Midi;
	velocity: number; // [0, 1]
};

// Parse basic information out of a MIDI message.
// https://stackoverflow.com/questions/40902864/how-to-parse-web-midi-api-input-messages-onmidimessage
export const parse_midi_message = (e: MIDIMessageEvent): MidiMessage => {
	return {
		command: e.data[0] >> 4,
		channel: e.data[0] & 0xf,
		note: e.data[1] as Midi, // TODO cast is needed because webMIDI doesn't include the type - should it?
		velocity: e.data[2] / 127,
	};
};

/**
 * Uses `navigator.requestMIDIAccess`, throwing an error on failure.
 * Callers should normally prefer to use `$lib/midi_access.ts#request_access` instead of this.
 * @param opts - WebMIDI options - https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
 * @returns
 */
export const request_midi_access = async (opts?: Partial<MIDIOptions>): Promise<MIDIAccess> => {
	const n = navigator as any;
	const request_access: requestMIDIAccess = n.requestMIDIAccess?.bind(n);
	if (!request_access) {
		throw Error(`Midi is not supported in this browser`);
	}
	const options: MIDIOptions = {
		sysex: undefined,
		software: undefined,
		...opts,
	};
	return request_access(options);
};

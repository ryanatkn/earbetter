import {BROWSER} from 'esm-env';

import type {
	MIDICommand,
	MIDIMessageEvent,
	MIDIOptions,
	MIDIAccess,
	MIDIChannel,
	requestMIDIAccess,
	MIDIInputMap,
	MIDIOutputMap,
	MIDIConnectionEvent,
} from '$lib/WebMIDI.js';
import type {Midi} from '$lib/music.js';
import {noop_ssr} from '$lib/util.js';

// WebMIDI helpers specific to cosmicplayground

export interface Midi_Message {
	command: (typeof MIDICommand)[number];
	channel: MIDIChannel;
	note: Midi;
	velocity: number; // [0, 1]
}

/**
 * Parse basic information out of a MIDI message.
 * https://stackoverflow.com/questions/40902864/how-to-parse-web-midi-api-input-messages-onmidimessage
 */
export const parse_midi_message = (e: MIDIMessageEvent): Midi_Message => {
	return {
		command: e.data[0] >> 4,
		channel: e.data[0] & 0xf,
		note: e.data[1],
		velocity: e.data[2] / 127,
	};
};

/**
 * Uses `navigator.requestMIDIAccess`, throwing an error on failure.
 * Callers should normally prefer to use `$lib/midi_access.ts#request_access` instead of this.
 * @param opts - WebMIDI options - https://developer.mozilla.org/en-US/docs/Web/API/WebMIDI_API
 */
export const request_midi_access = async (opts?: Partial<MIDIOptions>): Promise<MIDIAccess> => {
	if (!BROWSER) return new Midi_Access_Stub();
	const n = navigator as any;
	const request_access: requestMIDIAccess | undefined = n.requestMIDIAccess?.bind(n);
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

class Midi_Access_Stub extends EventTarget implements MIDIAccess {
	readonly inputs: MIDIInputMap = new Map();
	readonly outputs: MIDIOutputMap = new Map();
	onstatechange: (event: MIDIConnectionEvent) => void = noop_ssr;
	readonly sysexEnabled: boolean = false;
}

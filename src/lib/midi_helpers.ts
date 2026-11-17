import { BROWSER } from 'esm-env';

import type { Midi } from './music.ts';

/**
 * The MIDI status nibbles this app handles.
 */
export const MidiCommand = {
	Stop: 8,
	Start: 9,
	Knob: 11,
	PitchBend: 14
} as const;
export type MidiCommand = (typeof MidiCommand)[keyof typeof MidiCommand];

export interface MidiMessage {
	/**
	 * The status nibble, which may be a command other than the `MidiCommand`s.
	 */
	command: number;
	/**
	 * Zero-based, 0 through 15.
	 */
	channel: number;
	note: Midi;
	velocity: number; // [0, 1]
}

/**
 * Parse basic information out of a MIDI message, or `null` if it has no data.
 * https://stackoverflow.com/questions/40902864/how-to-parse-web-midi-api-input-messages-onmidimessage
 */
export const parse_midi_message = (e: MIDIMessageEvent): MidiMessage | null => {
	const { data } = e;
	if (!data || data.length < 3) return null;
	return {
		command: data[0]! >> 4,
		channel: data[0]! & 0xf,
		note: data[1]!,
		velocity: data[2]! / 127
	};
};

/**
 * Uses `navigator.requestMIDIAccess`, throwing an error on failure.
 * Callers should normally prefer to use `$lib/midi_access.ts#request_access` instead of this.
 * @param options - WebMIDI options - https://developer.mozilla.org/en-US/docs/Web/API/WebMIDI_API
 */
export const request_midi_access = async (options?: MIDIOptions): Promise<MIDIAccess> => {
	if (!BROWSER || !('requestMIDIAccess' in navigator)) {
		throw Error(`MIDI is not supported in this browser`);
	}
	return navigator.requestMIDIAccess(options);
};

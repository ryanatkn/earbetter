import {z} from 'zod';
import type {Flavored} from '@feltjs/util';

import type {Frequency} from '$lib/audio/helpers';
import {DEFAULT_TUNING} from '$lib/music/helpers';

// TODO min audible Midi (max too?)

// This project uses `Midi`, the midi number,
// as the standard musical note identity.
// This comes with drawbacks, the obvious one being that
// midi numbers are meaningless to most people,
// but for our purposes the benefits seem to outweight the downsides.
// `Midi` is unambiguous, efficient,
// and easy to work with both programmatically and mathematically.
// export type Midi = Flavored<number, 'Midi'>;
export const Midi = z.number().int().min(0).max(127);
export type Midi = Flavored<z.infer<typeof Midi>, 'Midi'>;

export const MIDI_MIN = 0;
export const MIDI_MAX = 127;

export const midis: Midi[] = Object.freeze(
	Array.from({length: MIDI_MAX + 1}, (_, i) => i),
) as Midi[];

export const is_midi = (n: number): n is Midi =>
	n >= MIDI_MIN && n <= MIDI_MAX && Number.isInteger(n);

// note/midi/frequency formulas: https://newt.phys.unsw.edu.au/jw/notes.html
export const midi_to_freq = (midi: Midi, tuning: Frequency = DEFAULT_TUNING): Frequency =>
	2 ** ((midi - 69) / 12) * tuning;

export const freq_to_midi = (freq: Frequency, tuning: Frequency): Midi =>
	Math.round(12 * Math.log2(freq / tuning) + 69) as Midi;

export const freq_to_midi_safe = (freq: Frequency, tuning: Frequency): Midi | null => {
	const midi = freq_to_midi(freq, tuning);
	if (!is_midi(midi)) return null;
	return midi;
};

import {z} from 'zod';
import type {Flavored} from '@feltjs/util';

import type {Frequency} from '$lib/audio/helpers';
import {DEFAULT_TUNING, pitch_classes, type PitchClass} from '$lib/music/helpers';
import {NOTE_SHARP_SYMBOL, type Chroma, type NoteName, type Octave} from '$lib/music/notes';

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

// TODO consider converting all of these to `Map`s
// TODO do we want to remove the `midi` part of these data array names, or otherwise rename them?
// maybe instead of `midiFoos`, rename to `noteFoos`?
export const midi_chromas: Chroma[] = Object.freeze(midis.map((m) => (m % 12) + 1)) as Chroma[];
export const midi_pitch_classes: PitchClass[] = Object.freeze(
	midis.map((m) => pitch_classes[midi_chromas[m] - 1]),
) as PitchClass[];
export const midi_octaves: Octave[] = Object.freeze(
	midis.map((m) => Math.floor(m / 12) - 1),
) as Octave[];
export const midi_names: NoteName[] = Object.freeze(
	midis.map((m) => midi_pitch_classes[m] + midi_octaves[m]),
) as NoteName[];
export const midi_naturals: Set<Midi> = new Set(
	midis.filter((m) => midi_pitch_classes[m][1] !== NOTE_SHARP_SYMBOL),
);

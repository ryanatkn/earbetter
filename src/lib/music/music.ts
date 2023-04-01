import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';
import {signal, type Signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';

import {type Hsl, hsl_to_string, type Hue} from '$lib/util/colors';
import type {Frequency} from '$lib/audio/helpers';

// `Midi` is our primary means of identifying notes,
// and its type is a number with a min of 0, just like array indices.
// The result is that arrays are great for storing static `Midi` data.
// Using the `Midi` number everywhere as array indices has its drawbacks,
// but it's really nice to program with, and it's efficient.
// Using flat data structures instead of objects to pack up this data
// makes the code very naturally extensible - any new data associated to `Midi`
// is just an array of anything that can live anywhere,
// and these arrays are always indexed by `Midi` number.

export const DEFAULT_TUNING = 440; // https://en.wikipedia.org/wiki/A440_(pitch_standard)

export const NOTE_FLAT_SYMBOL = '♭';
export const NOTE_SHARP_SYMBOL = '♯';
export type NoteName =
  | 'C-1' | 'C♯-1' | 'D-1' | 'D♯-1' | 'E-1' | 'F-1' | 'F♯-1' | 'G-1' | 'G♯-1' | 'A-1' | 'A♯-1' | 'B-1'
  | 'C0'  | 'C♯0'  | 'D0'  | 'D♯0'  | 'E0'  | 'F0'  | 'F♯0'  | 'G0'  | 'G♯0'  | 'A0'  | 'A♯0'  | 'B0'
  | 'C1'  | 'C♯1'  | 'D1'  | 'D♯1'  | 'E1'  | 'F1'  | 'F♯1'  | 'G1'  | 'G♯1'  | 'A1'  | 'A♯1'  | 'B1'
  | 'C2'  | 'C♯2'  | 'D2'  | 'D♯2'  | 'E2'  | 'F2'  | 'F♯2'  | 'G2'  | 'G♯2'  | 'A2'  | 'A♯2'  | 'B2'
  | 'C3'  | 'C♯3'  | 'D3'  | 'D♯3'  | 'E3'  | 'F3'  | 'F♯3'  | 'G3'  | 'G♯3'  | 'A3'  | 'A♯3'  | 'B3'
  | 'C4'  | 'C♯4'  | 'D4'  | 'D♯4'  | 'E4'  | 'F4'  | 'F♯4'  | 'G4'  | 'G♯4'  | 'A4'  | 'A♯4'  | 'B4'
  | 'C5'  | 'C♯5'  | 'D5'  | 'D♯5'  | 'E5'  | 'F5'  | 'F♯5'  | 'G5'  | 'G♯5'  | 'A5'  | 'A♯5'  | 'B5'
  | 'C6'  | 'C♯6'  | 'D6'  | 'D♯6'  | 'E6'  | 'F6'  | 'F♯6'  | 'G6'  | 'G♯6'  | 'A6'  | 'A♯6'  | 'B6'
  | 'C7'  | 'C♯7'  | 'D7'  | 'D♯7'  | 'E7'  | 'F7'  | 'F♯7'  | 'G7'  | 'G♯7'  | 'A7'  | 'A♯7'  | 'B7'
  | 'C8'  | 'C♯8'  | 'D8'  | 'D♯8'  | 'E8'  | 'F8'  | 'F♯8'  | 'G8'  | 'G♯8'  | 'A8'  | 'A♯8'  | 'B8'
  | 'C9'  | 'C♯9'  | 'D9'  | 'D♯9'  | 'E9'  | 'F9'  | 'F♯9'  | 'G9'; // prettier-ignore

export const chromas = Object.freeze([1,  2,  3,  4,  5,  6,  7,  8,  9,  10,  11, 12] as const); // prettier-ignore
export type Chroma = (typeof chromas)[number]; // corresponds to indices of `pitch_classes` + 1

export type Octave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Semitones = Flavored<number, 'Semitones'>;
export const Semitones = z.number().int().transform<Semitones>(identity);

export const Intervals = z.array(Semitones);
export type Intervals = z.infer<typeof Intervals>;

// TODO replace with zod? how?
export const serialize_intervals = (intervals: Intervals): string => intervals.join(', ');
export const parse_intervals = (value: string): Intervals =>
	value
		.split(',')
		.map((v) => Number(v.trim()) | 0)
		.filter(Boolean); // exclude 0 intentionally

export const compute_naturals = (min: Midi, max: Midi): Midi[] => {
	const naturals: Midi[] = [];
	for (let i = min; i <= max; i++) {
		if (midi_naturals.has(i)) naturals.push(i);
	}
	return naturals;
};

export const transpose = (midi: Midi, semitones: Semitones): Midi => {
	const transposed = midi + semitones;
	if (!is_midi(transposed)) {
		throw Error(`Failed to transpose midi ${midi} by ${semitones}`);
	}
	return transposed;
};

// TODO the hue shouldn't be hardcoded from the chroma - this relationship should be user-customizable (`app.colors` or `app.audio.colors` or something)
export const chroma_to_hue: Map<Chroma, Hue> = new Map(
	chromas.map((chroma) => [chroma, (chroma - 1) / 12]),
);
// TODO consider changing to a memoized helper function with optional saturation+lightness
export const chroma_to_hsl: Map<Chroma, Hsl> = new Map(
	chromas.map((chroma) => [chroma, [chroma_to_hue.get(chroma)!, 0.5, 0.5] as const]),
);
export const chroma_to_hsl_string: Map<Chroma, string> = new Map(
	chromas.map((chroma) => [chroma, hsl_to_string(...chroma_to_hsl.get(chroma)!)]),
);

export const interval_short_names = Object.freeze([
	'P1',
	'm2',
	'M2',
	'm3',
	'M3',
	'P4',
	'd5',
	'P5',
	'm6',
	'M6',
	'm7',
	'M7',
	'P8',
] as const);

export type IntervalShortNames = (typeof interval_short_names)[number];

export const interval_names = Object.freeze([
	'perfect unison',
	'minor second',
	'major second',
	'minor third',
	'major third',
	'perfect fourth',
	'diminished fifth',
	'perfect fifth',
	'minor sixth',
	'major sixth',
	'minor seventh',
	'major seventh',
	'perfect octave',
] as const);

export type IntervalNames = (typeof interval_names)[number];

const ENABLED_NOTES_KEY = Symbol('enabled_notes');
export const get_enabled_notes = (): Signal<Set<Midi> | null> => getContext(ENABLED_NOTES_KEY);
export const set_enabled_notes = (
	store: Signal<Set<Midi> | null> = signal(null),
): Signal<Set<Midi> | null> => setContext(ENABLED_NOTES_KEY, store);

export type ScaleName = Flavored<string, 'ScaleName'>;
export const ScaleName = z.string().transform<ScaleName>(identity);

// TODO this type is like `Semitone` with more restrictions
export type ScaleNoteIndex = Flavored<number, 'ScaleNoteIndex'>;
export const ScaleNoteIndex = z.number().min(1).max(11).transform<ScaleNoteIndex>(identity);

export const Scale = z.object({
	name: ScaleName,
	notes: z.array(ScaleNoteIndex),
});
export type Scale = z.infer<typeof Scale>;

export const scales: Scale[] = [
	{name: 'chromatic', notes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]},
	{name: 'major (Ionian)', notes: [2, 4, 5, 7, 9, 11]},
	{name: 'minor (Aeolian)', notes: [2, 3, 5, 7, 8, 10]},
	{name: 'Dorian', notes: [2, 3, 5, 7, 9, 10]},
	{name: 'Phrygian', notes: [1, 3, 5, 7, 8, 10]},
	{name: 'Lydian', notes: [2, 4, 6, 7, 9, 11]},
	{name: 'Mixolydian', notes: [2, 4, 5, 7, 9, 10]},
	{name: 'Locrian', notes: [1, 3, 5, 6, 8, 10]},
	{name: 'pentatonic', notes: [2, 4, 7, 9]},
	{name: 'octatonic', notes: [2, 3, 5, 6, 8, 9, 11]},
];
export const DEFAULT_SCALE = scales[0];

export const scale_by_name: Map<ScaleName, Scale> = new Map(scales.map((s) => [s.name, s]));
export const lookup_scale = (name: ScaleName): Scale => {
	const found = scale_by_name.get(name);
	if (!found) throw Error('unknown scale ' + name);
	return found;
};

// TODO BLOCK name?
export const to_scale_notes = (scale: Scale, octaves: number): Semitones[] => {
	const notes: number[] = [];
	for (let i = 0; i < octaves; i++) {
		const up = i % 2 === 0;
		const direction = up ? 1 : -1; // up, up, down, up, down, up, ...
		// `degree` is the offset multiplier from the base scale, so 2 is the second octave both up and down
		const degree = up ? i / 2 : (i + 1) / 2;
		for (const n of scale.notes) {
			console.log(`i, n, up, direction, degree`, i, n, up, direction, degree);
			notes.push(n + 12 * direction * degree);
		}
		notes.push(12 * direction * (degree || 1)); // include the octave up, but not 0
	}
	return notes;
};

const SCALE_KEY = Symbol('scale');
export const get_scale = (): Signal<Scale> => getContext(SCALE_KEY);
export const set_scale = (store: Signal<Scale> = signal(DEFAULT_SCALE)): Signal<Scale> =>
	setContext(SCALE_KEY, store);

export const PitchClass = z.enum(['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']);
export type PitchClass = z.infer<typeof PitchClass>;
export const pitch_classes = PitchClass.options;
export const DEFAULT_PITCH_CLASS = pitch_classes[0];
export const pitch_class_aliases: Record<PitchClass, string> = {
	'C♯': 'D♭',
	'D♯': 'E♭',
	'F♯': 'G♭',
	'G♯': 'A♭',
	'A♯': 'B♭',
} as Record<PitchClass, string>; // TODO the `♯` appear to cause TS to bug out? try to remove this later

const KEY_KEY = Symbol('key');
export const get_key = (): Signal<PitchClass> => getContext(KEY_KEY);
export const set_key = (store: Signal<PitchClass> = signal(pitch_classes[0])): Signal<PitchClass> =>
	setContext(KEY_KEY, store);

export const to_notes = (
	scale: Scale,
	key: PitchClass = 'C',
	min_note: Midi = MIDI_MIN,
	max_note: Midi = MIDI_MAX,
): Set<Midi> => {
	const midis: Midi[] = [];
	const pitch_class_offset = pitch_classes.indexOf(key);
	const min_note_offset = pitch_classes.indexOf(midi_pitch_classes[min_note]);
	const initial_offset = pitch_class_offset - min_note_offset;
	for (let i = min_note; i <= max_note; i++) {
		const offset = (i - initial_offset) % 12;
		if (offset === 0 || scale.notes.includes(offset)) midis.push(i);
	}
	return new Set(midis);
};

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

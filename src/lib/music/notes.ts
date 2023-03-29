import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

import {type Midi, is_midi, midi_naturals} from '$lib/music/midi';
import {type Hsl, hsl_to_string, type Hue} from '$lib/util/colors';

// `Midi` is our primary means of identifying notes,
// and its type is a number with a min of 0, just like array indices.
// The result is that arrays are great for storing static `Midi` data.
// Using the `Midi` number everywhere as array indices has its drawbacks,
// but it's really nice to program with, and it's efficient.
// Using flat data structures instead of objects to pack up this data
// makes the code very naturally extensible - any new data associated to `Midi`
// is just an array of anything that can live anywhere,
// and these arrays are always indexed by `Midi` number.

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
export const PitchClass = z.enum(['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']);
export type PitchClass = z.infer<typeof PitchClass>;
export const pitch_classes = PitchClass.options;
export const pitch_class_aliases: Record<PitchClass, string> = {
	'C♯': 'D♭',
	'D♯': 'E♭',
	'F♯': 'G♭',
	'G♯': 'A♭',
	'A♯': 'B♭',
} as Record<PitchClass, string>; // TODO the `♯` appear to cause TS to bug out? try to remove this later
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

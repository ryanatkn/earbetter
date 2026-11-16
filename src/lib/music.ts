import * as s from '@fuzdev/fuz_schema/schema.ts';
import { type Hsl, hsl_to_string, type Hue } from '@fuzdev/fuz_util/colors.ts';

import type { Frequency } from './audio_helpers.ts';

// ♩ ♪ ♫ ♬ ♯ ♮ ♭ 𝄪 𝄫 ø7 o o7 Δ 𝄐 𝄑 𝄞 𝄢 𝄡 𝆒 𝆓 𝄀 𝄁 𝄂 𝄃 𝄆 𝄇

/**
 * @see https://wikipedia.org/wiki/Musical_tuning
 * @see https://wikipedia.org/wiki/A440_(pitch_standard)
 */
export const DEFAULT_TUNING = 440;

export const NOTE_FLAT_SYMBOL = '♭';
export const NOTE_SHARP_SYMBOL = '♯';
/**
 * @see https://wikipedia.org/wiki/Musical_note
 */
export type NoteName =
	| 'C-1'
	| 'C♯-1'
	| 'D-1'
	| 'D♯-1'
	| 'E-1'
	| 'F-1'
	| 'F♯-1'
	| 'G-1'
	| 'G♯-1'
	| 'A-1'
	| 'A♯-1'
	| 'B-1'
	| 'C0'
	| 'C♯0'
	| 'D0'
	| 'D♯0'
	| 'E0'
	| 'F0'
	| 'F♯0'
	| 'G0'
	| 'G♯0'
	| 'A0'
	| 'A♯0'
	| 'B0'
	| 'C1'
	| 'C♯1'
	| 'D1'
	| 'D♯1'
	| 'E1'
	| 'F1'
	| 'F♯1'
	| 'G1'
	| 'G♯1'
	| 'A1'
	| 'A♯1'
	| 'B1'
	| 'C2'
	| 'C♯2'
	| 'D2'
	| 'D♯2'
	| 'E2'
	| 'F2'
	| 'F♯2'
	| 'G2'
	| 'G♯2'
	| 'A2'
	| 'A♯2'
	| 'B2'
	| 'C3'
	| 'C♯3'
	| 'D3'
	| 'D♯3'
	| 'E3'
	| 'F3'
	| 'F♯3'
	| 'G3'
	| 'G♯3'
	| 'A3'
	| 'A♯3'
	| 'B3'
	| 'C4'
	| 'C♯4'
	| 'D4'
	| 'D♯4'
	| 'E4'
	| 'F4'
	| 'F♯4'
	| 'G4'
	| 'G♯4'
	| 'A4'
	| 'A♯4'
	| 'B4'
	| 'C5'
	| 'C♯5'
	| 'D5'
	| 'D♯5'
	| 'E5'
	| 'F5'
	| 'F♯5'
	| 'G5'
	| 'G♯5'
	| 'A5'
	| 'A♯5'
	| 'B5'
	| 'C6'
	| 'C♯6'
	| 'D6'
	| 'D♯6'
	| 'E6'
	| 'F6'
	| 'F♯6'
	| 'G6'
	| 'G♯6'
	| 'A6'
	| 'A♯6'
	| 'B6'
	| 'C7'
	| 'C♯7'
	| 'D7'
	| 'D♯7'
	| 'E7'
	| 'F7'
	| 'F♯7'
	| 'G7'
	| 'G♯7'
	| 'A7'
	| 'A♯7'
	| 'B7'
	| 'C8'
	| 'C♯8'
	| 'D8'
	| 'D♯8'
	| 'E8'
	| 'F8'
	| 'F♯8'
	| 'G8'
	| 'G♯8'
	| 'A8'
	| 'A♯8'
	| 'B8'
	| 'C9'
	| 'C♯9'
	| 'D9'
	| 'D♯9'
	| 'E9'
	| 'F9'
	| 'F♯9'
	| 'G9';

/**
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const chromas = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const);
/**
 * The numerical equivalent to `PitchClass`.
 * Corresponds to indices of `pitch_classes` + 1.
 *
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const Chroma = s.one_of([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
export type Chroma = s.Infer<typeof Chroma>; // TODO doesn't use `Flavored` because it's incompatible with indexing elsewhere

/**
 * The text equivalent to `Chroma`.
 * Each index corresponds to `chromas` - 1.
 *
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const pitch_classes = [
	'C',
	'C♯',
	'D',
	'D♯',
	'E',
	'F',
	'F♯',
	'G',
	'G♯',
	'A',
	'A♯',
	'B'
] as const;
export const PitchClass = s.one_of(pitch_classes);
export type PitchClass = s.Infer<typeof PitchClass>;
export const DEFAULT_PITCH_CLASS = pitch_classes[0];
export const pitch_class_aliases: Record<PitchClass, string> = {
	'C♯': 'D♭',
	'D♯': 'E♭',
	'F♯': 'G♭',
	'G♯': 'A♭',
	'A♯': 'B♭'
} as Record<PitchClass, string>; // TODO the `♯` appear to cause TS to bug out? try to remove this later

/**
 * @see https://wikipedia.org/wiki/Octave
 */
export const Octave = s.flavor(s.one_of([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 'Octave');
export type Octave = s.Infer<typeof Octave>;

/**
 * @see https://wikipedia.org/wiki/Semitone
 */
export const Semitones = s.flavor(s.pipe(s.number, s.safe_integer), 'Semitones');
export type Semitones = s.Infer<typeof Semitones>;

/**
 * @see https://wikipedia.org/wiki/Interval_(music)
 */
export const Intervals = s.flavor(
	s.array(Semitones) as s.Schema<ReadonlyArray<Semitones>>,
	'Intervals'
);
export type Intervals = s.Infer<typeof Intervals>;
// TODO also probably add a min/max
export const serialize_intervals = (intervals: Intervals): string => intervals.join(', ');
export const parse_intervals = (value: string): Intervals =>
	// TODO use a real `unique` helper
	Array.from(
		new Set(
			value
				.split(',')
				.map((v) => parseInt(v, 10))
				.filter((v) => !!v && v <= MIDI_MAX && v >= -MIDI_MAX) // exclude 0 intentionally
		)
	);

/**
 * @see https://wikipedia.org/wiki/Natural_(music)
 */
export const compute_naturals = (min: Midi, max: Midi): Array<Midi> => {
	const naturals: Array<Midi> = [];
	for (let i = min; i <= max; i++) {
		if (midi_naturals.has(i)) naturals.push(i);
	}
	return naturals;
};

/**
 * @see https://wikipedia.org/wiki/Transpose_music
 */
export const transpose = (note: Midi, semitones: Semitones): Midi | null => {
	const transposed = note + semitones;
	if (!is_midi(transposed)) {
		return null;
	}
	return transposed;
};

// TODO the hue shouldn't be hardcoded from the chroma - this relationship should be user-customizable (`app.colors` or `app.audio.colors` or something)
/**
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const chroma_to_hue: Map<Chroma, Hue> = new Map(
	chromas.map((chroma) => [chroma, (chroma - 1) / 12])
);
// TODO consider changing to a memoized helper function with optional saturation+lightness
/**
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const chroma_to_hsl: Map<Chroma, Hsl> = new Map(
	chromas.map((chroma) => [chroma, [chroma_to_hue.get(chroma)!, 0.5, 0.5] as const])
);
/**
 * @see https://wikipedia.org/wiki/Pitch_class
 */
export const chroma_to_hsl_string: Map<Chroma, string> = new Map(
	chromas.map((chroma) => [chroma, hsl_to_string(...chroma_to_hsl.get(chroma)!)])
);

/**
 * @see https://wikipedia.org/wiki/Interval_(music)
 */
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
	'P8'
] as const);
/**
 * @see https://wikipedia.org/wiki/Interval_(music)
 */
export const IntervalShortNames = s.one_of(interval_short_names);
export type IntervalShortNames = s.Infer<typeof IntervalShortNames>;

/**
 * @see https://wikipedia.org/wiki/Interval_(music)
 */
export const interval_names = Object.freeze([
	'perfect unison',
	'minor second',
	'major second',
	'minor third',
	'major third',
	'perfect fourth',
	'tritone', // TODO maybe instead use "diminished fifth/augmented fourth"? is pretty wordy tho
	'perfect fifth',
	'minor sixth',
	'major sixth',
	'minor seventh',
	'major seventh',
	'perfect octave'
] as const);
/**
 * @see https://wikipedia.org/wiki/Interval_(music)
 */
export const IntervalNames = s.one_of(interval_names);
export type IntervalNames = s.Infer<typeof IntervalNames>;

/**
 * @see https://wikipedia.org/wiki/Scale_(music)
 */
export const ScaleName = s.flavor(s.string, 'ScaleName');
export type ScaleName = s.Infer<typeof ScaleName>;

/**
 * @see https://wikipedia.org/wiki/Scale_(music)
 */
export const Scale = s.object({
	name: ScaleName,
	notes: s.array(Semitones)
});
export type Scale = s.Infer<typeof Scale>;

/**
 * @see https://wikipedia.org/wiki/Scale_(music)
 * @see https://wikipedia.org/wiki/Mode_(music)
 */
export const scales: Array<Scale> = [
	{ name: 'chromatic', notes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
	{ name: 'major', notes: [2, 4, 5, 7, 9, 11] },
	{ name: 'minor', notes: [2, 3, 5, 7, 8, 10] },
	{ name: 'Dorian', notes: [2, 3, 5, 7, 9, 10] },
	{ name: 'Phrygian', notes: [1, 3, 5, 7, 8, 10] },
	{ name: 'Lydian', notes: [2, 4, 6, 7, 9, 11] },
	{ name: 'Mixolydian', notes: [2, 4, 5, 7, 9, 10] },
	{ name: 'Locrian', notes: [1, 3, 5, 6, 8, 10] },
	{ name: 'major pentatonic', notes: [2, 4, 7, 9] }, // https://wikipedia.org/wiki/Pentatonic_scale
	{ name: 'octatonic collection', notes: [2, 3, 5, 6, 8, 9, 11] } // https://wikipedia.org/wiki/Octatonic_scale
];
export const DEFAULT_SCALE = scales[0]!;

export const scale_by_name: Map<ScaleName, Scale> = new Map(scales.map((s) => [s.name, s]));
export const lookup_scale = (name: ScaleName): Scale => {
	const found = scale_by_name.get(name);
	if (!found) throw Error('unknown scale ' + name);
	return found;
};

export const to_scale_notes = (scale: Scale, octaves: number): Intervals => {
	const notes: Array<number> = [];
	for (let i = 0; i < octaves; i++) {
		const up = i % 2 === 0;
		const direction = up ? 1 : -1;
		// `degree` is the offset multiplier from the base scale, so 2 is the second octave both up and down
		const degree = up ? i / 2 : (i + 1) / 2;
		for (const n of scale.notes) {
			notes.push(n + 12 * direction * degree);
		}
		notes.push(12 * direction * (up ? degree + 1 : degree)); // include the octave up, but not 0 (do we want 0 tho?)
	}
	return notes;
};

export const to_notes_in_scale = (
	scale: Scale,
	key: PitchClass = 'C',
	min_note: Midi = MIDI_MIN,
	max_note: Midi = MIDI_MAX
): Set<Midi> => {
	const notes: Set<Midi> = new Set();
	// midi 0 is a C, so a note's distance from the key is relative to the key's pitch class index
	const key_offset = pitch_classes.indexOf(key);
	for (let i = min_note; i <= max_note; i++) {
		const offset = (i - key_offset + 12) % 12;
		if (offset === 0 || scale.notes.includes(offset)) {
			notes.add(i);
		}
	}
	return notes;
};

export const MIDI_MIN = 0;
export const MIDI_MAX = 127;

/**
 * This code uses `Midi`, the midi index from 0 to 127,
 * as the standard musical note identity.
 * This comes with drawbacks, the obvious one being that
 * midi indices are meaningless to most people,
 * but for our purposes the benefits seem to outweight the downsides.
 * The midi index is unambiguous, efficient,
 * and easy to work with both programmatically and mathematically.
 *
 * @see https://wikipedia.org/wiki/MIDI
 */
export const Midi = s.flavor(
	s.pipe(s.number, s.integer, s.min_value(MIDI_MIN), s.max_value(MIDI_MAX)),
	'Midi'
);
export type Midi = s.Infer<typeof Midi>;

export const midis: Array<Midi> = Object.freeze(
	Array.from({ length: MIDI_MAX + 1 }, (_, i) => i)
) as Array<Midi>;

export const is_midi = (n: number): n is Midi =>
	n >= MIDI_MIN && n <= MIDI_MAX && Number.isInteger(n);

/**
 * @see https://newt.phys.unsw.edu.au/jw/notes.html
 */
export const midi_to_freq = (note: Midi, tuning: Frequency = DEFAULT_TUNING): Frequency =>
	2 ** ((note - 69) / 12) * tuning;

/**
 * @see https://newt.phys.unsw.edu.au/jw/notes.html
 */
export const freq_to_midi = (freq: Frequency, tuning: Frequency): Midi =>
	Math.round(12 * Math.log2(freq / tuning) + 69);

/**
 * Like `freq_to_midi`, but returns `null` if the result is not a valid MIDI value.
 * @see https://newt.phys.unsw.edu.au/jw/notes.html
 */
export const freq_to_midi_safe = (freq: Frequency, tuning: Frequency): Midi | null => {
	const midi = freq_to_midi(freq, tuning);
	if (!is_midi(midi)) return null;
	return midi;
};

// TODO consider converting all of these to `Map`s
// TODO do we want to remove the `midi` part of these data array names, or otherwise rename them? maybe instead of `midi_*`, rename to `note_*`?

export const midi_chromas: Array<Chroma> & Record<Midi, Chroma> = Object.freeze(
	midis.map((m) => (m % 12) + 1)
) as Array<Chroma>;

export const midi_pitch_classes: Array<PitchClass> & Record<Midi, PitchClass> = Object.freeze(
	midis.map((m) => pitch_classes[midi_chromas[m]! - 1]!)
) as Array<PitchClass>;

export const midi_octaves: Array<Octave> & Record<Midi, Octave> = Object.freeze(
	midis.map((m) => Math.floor(m / 12) - 1)
) as Array<Octave>;

export const midi_names: Array<NoteName> & Record<Midi, NoteName> = Object.freeze(
	midis.map((m) => midi_pitch_classes[m]! + midi_octaves[m]!)
) as Array<NoteName>;

/**
 * @see https://wikipedia.org/wiki/Natural_(music)
 */
export const midi_naturals: Set<Midi> = new Set(
	midis.filter((m) => midi_pitch_classes[m]![1] !== NOTE_SHARP_SYMBOL)
);

export const serialize_notes = (notes: ReadonlyArray<Midi> | null): string =>
	notes ? notes.join(', ') : '';
export const parse_notes = (value: string): Array<Midi> =>
	Array.from(
		new Set(
			value
				.split(',')
				.map((v) => Number(v.trim()) | 0)
				.filter((v) => !!v && s.is(Midi, v)) // exclude 0 because empty and non-numeric input parses to it
		)
	).sort((a, b) => a - b);

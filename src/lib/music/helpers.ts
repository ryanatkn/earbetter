import {Signal, signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';

import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';

export const DEFAULT_TUNING = 440; // https://en.wikipedia.org/wiki/A440_(pitch_standard)

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

const ENABLED_KEYS_KEY = Symbol('enabled_keys');
export const get_enabled_keys = (): Signal<Set<Midi> | null> => getContext(ENABLED_KEYS_KEY);
export const set_enabled_keys = (store = signal(null)): Signal<Set<Midi> | null> =>
	setContext(ENABLED_KEYS_KEY, store);

// TODO BLOCK convert to zod
export type NoteSet =
	| 'chromatic'
	| 'pentatonic'
	| 'major'
	| 'minor'
	| 'Dorian'
	| 'Phrygian'
	| 'Lydian'
	| 'Mixolydian'
	| 'Locrian'
	| 'octatonic';
const scales: Record<NoteSet, Midi[]> = {
	chromatic: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	pentatonic: [2, 4, 7, 9],
	// TODO include `diatonic`? maybe in a `name` property?
	major: [2, 4, 5, 7, 9, 11], // TODO include `Ionian`, maybe in `name`?
	minor: [2, 3, 5, 7, 8, 10], // TODO include `Aeolian`, maybe in `name`?
	Dorian: [2, 3, 5, 7, 9, 10],
	Phrygian: [1, 3, 5, 7, 8, 10],
	Lydian: [2, 4, 6, 7, 9, 11],
	Mixolydian: [2, 4, 5, 7, 9, 10],
	Locrian: [1, 3, 5, 6, 8, 10],
	octatonic: [2, 3, 5, 6, 8, 9, 11],
};
export const note_sets: NoteSet[] = [
	'chromatic',
	'pentatonic',
	'major',
	'minor',
	'Dorian',
	'Phrygian',
	'Lydian',
	'Mixolydian',
	'Locrian',
	'octatonic',
];
// TODO memoize?
export const to_notes = (
	note_set: NoteSet,
	// TODO BLOCK pass `tonic` as a separate param? could default to C
	midi_min: Midi = MIDI_MIN, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
	midi_max: Midi = MIDI_MAX, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
): Set<Midi> => {
	const midis: Midi[] = [];
	const scale = scales[note_set];
	const initial_offset = 0; // TODO BLOCK
	for (let i = midi_min; i <= midi_max; i++) {
		const offset = (i - initial_offset) % 12;
		if (offset === 0 || scale.includes(offset)) midis.push(i);
	}
	return new Set(midis);
};

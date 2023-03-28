import {Signal, signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';
import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

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

export type ScaleName = Flavored<string, 'ScaleName'>;
export const ScaleName = z.string().transform<ScaleName>(identity);
export const ScaleDegree = z.number().min(1).max(11);
export type RealmId = Flavored<string, 'Realm'>;
export const RealmId = z.string().uuid().transform<RealmId>(identity);

export const Scale = z.object({
	name: ScaleName,
	notes: z.array(ScaleDegree),
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

export const scale_by_name: Map<ScaleName, Scale> = new Map(scales.map((s) => [s.name, s]));

// TODO memoize?
export const to_notes = (
	scale: Scale,
	// TODO BLOCK pass `tonic` as a separate param? could default to C
	midi_min: Midi = MIDI_MIN, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
	midi_max: Midi = MIDI_MAX, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
): Set<Midi> => {
	const midis: Midi[] = [];
	const initial_offset = 0; // TODO BLOCK
	for (let i = midi_min; i <= midi_max; i++) {
		const offset = (i - initial_offset) % 12;
		if (offset === 0 || scale.notes.includes(offset)) midis.push(i);
	}
	return new Set(midis);
};

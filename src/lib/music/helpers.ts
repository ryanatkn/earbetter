import {Signal, signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';
import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';
import {midi_pitch_classes, pitch_classes, type PitchClass} from '$lib/music/notes';

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

const ENABLED_NOTES_KEY = Symbol('enabled_notes');
export const get_enabled_notes = (): Signal<Set<Midi> | null> => getContext(ENABLED_NOTES_KEY);
export const set_enabled_notes = (store = signal(null)): Signal<Set<Midi> | null> =>
	setContext(ENABLED_NOTES_KEY, store);

export type ScaleName = Flavored<string, 'ScaleName'>;
export const ScaleName = z.string().transform<ScaleName>(identity);

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

export const scale_by_name: Map<ScaleName, Scale> = new Map(scales.map((s) => [s.name, s]));

export const to_notes = (
	scale: Scale,
	pitch_class: PitchClass = 'C',
	// TODO BLOCK pass `tonic` as a separate param? could default to C
	min_note: Midi = MIDI_MIN, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
	max_note: Midi = MIDI_MAX, // TODO BLOCK pass these in at the callsite using the "lowest/highest MIDI key"
): Set<Midi> => {
	const midis: Midi[] = [];
	const pitch_class_offset = pitch_classes.indexOf(pitch_class);
	const min_note_offset = pitch_classes.indexOf(midi_pitch_classes[min_note]);
	const initial_offset = pitch_class_offset - min_note_offset;
	for (let i = min_note; i <= max_note; i++) {
		const offset = (i - initial_offset) % 12;
		if (offset === 0 || scale.notes.includes(offset)) midis.push(i);
	}
	return new Set(midis);
};

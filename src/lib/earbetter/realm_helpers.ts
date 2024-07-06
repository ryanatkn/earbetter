import {interval_names, lookup_scale, to_scale_notes, type Scale_Name} from '$lib/music.js';
import {Realm_Data, Realm_Name} from '$lib/earbetter/realm.js';
import type {Level_Data} from '$lib/earbetter/level.js';

// TODO expand the default levels
// variants that go down, not just up
// variants for 4 notes on 3 total ones
// variants for 3-4 total notes instead of a whole octave

export const to_default_scale_realm = (
	scale_name: Scale_Name,
	realm_name: Realm_Name = scale_name as string,
): Realm_Data => {
	const levels: Array<Partial<Level_Data>> = [];

	const scale = lookup_scale(scale_name);
	const {notes} = scale;

	// compare adjacent pairs
	for (let i = 0; i < notes.length - 1; i++) {
		const note1 = notes[i];
		const note2 = notes[i + 1];
		levels.push({
			name: interval_names[note1] + ' vs ' + interval_names[note2],
			intervals: [note1, note2],
		});
	}
	// compare adjacent pairs downward
	for (let i = 0; i < notes.length - 1; i++) {
		const note1 = notes[i];
		const note2 = notes[i + 1];
		levels.push({
			name: interval_names[note1] + ' vs ' + interval_names[note2] + ' (downward)',
			intervals: [note1 - 12, note2 - 12],
		});
	}
	levels.push({
		name: 'one octave',
		intervals: notes,
	});
	// TODO for the 4 note variants, maybe include the note at the start of the next octave?
	levels.push({
		name: 'one octave (4 notes)',
		intervals: notes,
		sequence_length: 4,
	});
	levels.push({
		name: 'one octave (8 notes)',
		intervals: notes,
		sequence_length: 8,
	});
	levels.push({
		name: 'two octaves',
		intervals: to_scale_notes(scale, 2),
	});
	levels.push({
		name: 'two octaves (4 notes)',
		intervals: to_scale_notes(scale, 2),
		sequence_length: 4,
	});
	levels.push({
		name: 'two octaves (8 notes)',
		intervals: to_scale_notes(scale, 2),
		sequence_length: 8,
	});
	levels.push({
		name: 'four octaves',
		intervals: to_scale_notes(scale, 4),
	});
	levels.push({
		name: 'four octaves (4 notes)',
		intervals: to_scale_notes(scale, 4),
		sequence_length: 4,
		min_note: 41,
		max_note: 96,
	});
	levels.push({
		name: 'four octaves (8 notes)',
		intervals: to_scale_notes(scale, 4),
		sequence_length: 8,
		min_note: 41,
		max_note: 96,
	});

	return Realm_Data.parse({name: realm_name, levels});
};

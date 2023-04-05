import {interval_names, lookup_scale, to_scale_notes, type ScaleName} from '$lib/music/music';
import {RealmData, RealmName} from '$lib/earbetter/realm';
import type {LevelData} from '$lib/earbetter/level';

export const to_default_scale_realm = (
	scale_name: ScaleName,
	realm_name: RealmName = scale_name as string,
): RealmData => {
	const levels: Array<Partial<LevelData>> = [];

	const scale = lookup_scale(scale_name);
	const {notes} = scale;

	for (let i = 0; i < notes.length - 1; i++) {
		const note1 = notes[i];
		const note2 = notes[i + 1];
		levels.push({
			name: interval_names[note1] + ' vs ' + interval_names[note2],
			intervals: [note1, note2],
		});
	}
	levels.push({
		name: 'one octave',
		intervals: notes,
	});
	levels.push({
		name: 'two octaves',
		intervals: to_scale_notes(scale, 2),
	});
	levels.push({
		name: 'four octaves',
		intervals: to_scale_notes(scale, 4),
	});
	levels.push({
		name: 'one octave (4 notes)',
		intervals: notes,
		sequence_length: 4,
	});
	levels.push({
		name: 'two octaves (4 notes)',
		intervals: to_scale_notes(scale, 2),
		sequence_length: 4,
	});
	levels.push({
		name: 'four octaves (4 notes)',
		intervals: to_scale_notes(scale, 4),
		sequence_length: 4,
	});
	levels.push({
		name: 'one octave (8 notes)',
		intervals: notes,
		sequence_length: 8,
	});
	levels.push({
		name: 'two octaves (8 notes)',
		intervals: to_scale_notes(scale, 2),
		sequence_length: 8,
	});
	levels.push({
		name: 'four octaves (8 notes)',
		intervals: to_scale_notes(scale, 4),
		sequence_length: 8,
	});

	return RealmData.parse({name: realm_name, levels});
};

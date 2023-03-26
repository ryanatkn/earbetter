import {create_realm_def, type RealmDef} from '$lib/earbetter/realm';
import {create_and_cache_level_def} from '$lib/earbetter/level_defs';
import {DEFAULT_NOTE_MIN} from '$lib/earbetter/level';

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

// TODO BLOCK maybe make a `default_project` module?
export const default_realm_defs: RealmDef[] = [
	{
		name: 'major pentatonic',
		levels: [
			create_and_cache_level_def({
				name: 'perfect fourth vs perfect octave',
				intervals: [5, 12],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'major third vs major sixth',
				intervals: [4, 9],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'major second vs major third',
				intervals: [2, 4],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'major third vs perfect fifth',
				intervals: [4, 7],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'major third vs perfect fourth',
				intervals: [4, 5],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'major third vs perfect fourth vs perfect fifth',
				intervals: [4, 5, 7],
				sequence_length: 2,
			}).id,
			create_and_cache_level_def({
				name: 'one octave',
				intervals: [2, 4, 7, 9],
			}).id,
			create_and_cache_level_def({
				name: 'two octaves',
				intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
			}).id,
			create_and_cache_level_def({
				name: 'three octaves',
				intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24],
			}).id,
		],
	},
	{
		name: 'major third vs perfect fourth',
		levels: [
			create_and_cache_level_def({
				name: 'one octave',
				sequence_length: 2,
				intervals: [4, 5],
			}).id,
			create_and_cache_level_def({
				name: 'two octaves',
				sequence_length: 2,
				intervals: [4, 5, -8, -7],
			}).id,
			create_and_cache_level_def({
				name: 'three octaves',
				sequence_length: 2,
				intervals: [4, 5, -8, -7, 16, 17],
			}).id,
			create_and_cache_level_def({
				name: 'four octaves',
				sequence_length: 2,
				intervals: [4, 5, -8, -7, 16, 17, -20, -19],
				note_min: DEFAULT_NOTE_MIN - 12,
			}).id,
			create_and_cache_level_def({
				name: 'two long octaves',
				intervals: [4, 5, -8, -7],
				sequence_length: 8,
			}).id,
			create_and_cache_level_def({
				name: 'three long octaves',
				intervals: [4, 5, -8, -7, 16, 17],
				sequence_length: 8,
			}).id,
			create_and_cache_level_def({
				name: 'four long octaves',
				intervals: [4, 5, -8, -7, 16, 17, -20, -19],
				sequence_length: 8,
			}).id,
		],
	},
	// TODO more - modes, particular intervals, scales, chromatic, ...?
	// what's best for learning and understanding and covering the landscape?
].map((d) => create_realm_def(d));

console.log(`default_realm_defs`, default_realm_defs);

// {
// 	name: 'minor pentatonic',
// 	intervals: [3, 5, 7, 10, 12, -9, -7, -5, -2, -12],
// },
// {
// 	name: 'major second vs major third (long)',
// 	intervals: [2, 4],
// 	sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
// },
// {
// 	name: 'major second vs major third vs perfect fourth (long)',
// 	intervals: [2, 4, 5],
// 	sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
// },
// {
// 	name: 'major scale (Ionian mode)',
// 	intervals: [2, 4, 5, 7, 9, 11, 12],
// },
// {
// 	name: 'minor scale (Aeolian mode)',
// 	intervals: [2, 3, 5, 7, 8, 10, 12],
// },
// {name: 'Dorian mode', intervals: [2, 3, 5, 7, 9, 10, 12]},
// {name: 'Phrygian mode', intervals: [1, 3, 5, 7, 8, 10, 12]},
// {name: 'Lydian mode', intervals: [2, 4, 6, 7, 9, 11, 12]},
// {name: 'Mixolydian mode', intervals: [2, 4, 5, 7, 9, 10, 12]},
// {name: 'Locrian mode', intervals: [1, 3, 5, 6, 8, 10, 12]},
// {name: 'octatonic scale', intervals: [2, 3, 5, 6, 8, 9, 11]},
// {
// 	name: 'major scale (long)',
// 	intervals: [2, 4, 5, 7, 9, 11, 12],
// 	sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
// },
// {
// 	name: 'major scale in both directions',
// 	intervals: [2, 4, 5, 7, 9, 11, 12, -1, -3, -5, -7, -8, -10, -12],
// },
// {
// 	name: 'major scale in both directions (long)',
// 	intervals: [2, 4, 5, 7, 9, 11, 12, -1, -3, -5, -7, -8, -10, -12],
// 	sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
// },
// {
// 	name: 'major scale up two octaves',
// 	intervals: [2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24],
// },
// {
// 	name: 'major scale up two octaves (long)',
// 	intervals: [2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24],
// 	sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
// },
// {
// 	name: 'chromatic scale (two octaves)',
// 	intervals: Array.from({length: 25}, (_, i) => i - 12),
// },
// {
// 	name: 'chromatic scale (four octaves)',
// 	intervals: Array.from({length: 49}, (_, i) => i - 24),
// },

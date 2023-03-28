import {RealmDef} from '$lib/earbetter/realm';
import {LevelDef, DEFAULT_NOTE_MIN} from '$lib/earbetter/level';
import {create_project_id, ProjectDef} from '$lib/earbetter/project';

const def = (): ProjectDef =>
	ProjectDef.parse({
		id: create_project_id(),
		realm_defs: [
			{
				name: 'major pentatonic',
				level_defs: [
					{
						name: 'perfect fourth vs perfect octave',
						intervals: [5, 12],
						sequence_length: 2,
					},
					{
						name: 'major third vs major sixth',
						intervals: [4, 9],
						sequence_length: 2,
					},
					{
						name: 'major second vs major third',
						intervals: [2, 4],
						sequence_length: 2,
					},
					{
						name: 'major third vs perfect fifth',
						intervals: [4, 7],
						sequence_length: 2,
					},
					{
						name: 'major third vs perfect fourth',
						intervals: [4, 5],
						sequence_length: 2,
					},
					{
						name: 'major third vs perfect fourth vs perfect fifth',
						intervals: [4, 5, 7],
						sequence_length: 2,
					},
					{
						name: 'one octave',
						intervals: [2, 4, 7, 9],
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
						sequence_length: 2,
					},
					{
						name: 'three octaves',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24],
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: [2, 4, 7, 9],
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
						sequence_length: 4,
					},
					{
						name: 'three octaves (4 notes)',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24],
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: [2, 4, 7, 9],
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
						sequence_length: 8,
					},
					{
						name: 'three octaves (8 notes)',
						intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24],
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
			{
				name: 'major third vs perfect fourth',
				level_defs: [
					{
						name: 'one octave',
						sequence_length: 2,
						intervals: [4, 5],
					},
					{
						name: 'two octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7],
					},
					{
						name: 'three octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7, 16, 17],
					},
					{
						name: 'four octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7, 16, 17, -20, -19],
						note_min: DEFAULT_NOTE_MIN - 12,
					},
					{
						name: 'two long octaves',
						intervals: [4, 5, -8, -7],
						sequence_length: 8,
					},
					{
						name: 'three long octaves',
						intervals: [4, 5, -8, -7, 16, 17],
						sequence_length: 8,
					},
					{
						name: 'four long octaves',
						intervals: [4, 5, -8, -7, 16, 17, -20, -19],
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
		].map((v) => RealmDef.parse(v)),
	});

export default def;

// TODO more - modes, particular intervals, scales, chromatic, ...?
// what's best for learning and understanding and covering the landscape?
// probably want helpers like
// `create_mode_realm({name: 'Dorian mode', intervals: [2, 3, 5, 7, 9, 10, 12]})`
// `create_mode_realm({name: 'chromatic', intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]})`
// and then you could have options for customizing the levels, and add new levels
//
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

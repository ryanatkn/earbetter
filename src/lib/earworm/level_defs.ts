import {dev} from '$app/environment';

import type {LevelDef} from '$lib/earworm/level';

export const BASE_LEVEL_DEF = {
	// TODO support something like this for 3-star accomplishment (or N-star)
	// we probably additionally want to say for each version not just the number of trials,
	// but the number of trials that must be correct to count as success (which should probably be 0 for the first level!)
	// trial_count: [2, 5, 25],
	trial_count: dev ? 2 : 5,
	sequence_length: dev ? 3 : 4,
	note_min: 48,
	note_max: 84,
} satisfies Partial<LevelDef>;

export const level_defs: LevelDef[] = [
	{
		id: '1 12',
		...BASE_LEVEL_DEF,
		intervals: [1, 12],
	},
	{
		id: '1 12 -1 -12',
		...BASE_LEVEL_DEF,
		intervals: [1, 12, -1, -12],
	},
	{
		id: '2 7',
		...BASE_LEVEL_DEF,
		intervals: [2, 7],
	},
	{
		id: '2 4',
		...BASE_LEVEL_DEF,
		intervals: [2, 4],
	},
	{
		id: '4 7',
		...BASE_LEVEL_DEF,
		intervals: [4, 7],
	},
	{
		id: '4 12',
		...BASE_LEVEL_DEF,
		intervals: [4, 12],
	},
	{
		id: '7 12',
		...BASE_LEVEL_DEF,
		intervals: [7, 12],
	},
	{
		id: '2 4 7',
		...BASE_LEVEL_DEF,
		intervals: [2, 4, 7],
	},
	{
		id: '4 7 12',
		...BASE_LEVEL_DEF,
		intervals: [4, 7, 12],
		sequence_length: dev ? 2 : 7,
	},
	{
		id: '2 4 7 12',
		...BASE_LEVEL_DEF,
		intervals: [2, 4, 7],
		sequence_length: dev ? 2 : 7,
	},
	{
		id: '4 7 12 -4 -7 -12',
		...BASE_LEVEL_DEF,
		intervals: [4, 7, 12, -4, -7, -12],
		sequence_length: dev ? 2 : 7,
	},
	{
		id: '1 2',
		...BASE_LEVEL_DEF,
		intervals: [1, 2],
	},
	{
		id: '2 3',
		...BASE_LEVEL_DEF,
		intervals: [2, 3],
	},
	{
		id: 'one full octave',
		...BASE_LEVEL_DEF,
		intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		sequence_length: dev ? 2 : 10,
	},
	{
		id: 'one full octave in both directions',
		...BASE_LEVEL_DEF,
		intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12], // prettier-ignore
		sequence_length: dev ? 2 : 10,
	},
];

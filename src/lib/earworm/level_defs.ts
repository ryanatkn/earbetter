import {
	create_id,
	DEFAULT_SEQUENCE_LENGTH,
	DEFAULT_TRIAL_COUNT,
	type LevelDef,
} from '$lib/earworm/level';

export const BASE_LEVEL_DEF = {
	// TODO support something like this for 3-star accomplishment (or N-star)
	// we probably additionally want to say for each version not just the number of trials,
	// but the number of trials that must be correct to count as success (which should probably be 0 for the first level!)
	// trial_count: [2, 5, 25],
	trial_count: DEFAULT_TRIAL_COUNT,
	sequence_length: DEFAULT_SEQUENCE_LENGTH,
	note_min: 48,
	note_max: 84,
} satisfies Partial<LevelDef>;

export const level_defs: LevelDef[] = [
	{
		name: '5 12',
		intervals: [5, 12],
		sequence_length: 2,
	},
	{
		name: '4 7',
		intervals: [4, 7],
		sequence_length: 2,
	},
	{
		name: '2 12 -1 -12',
		intervals: [2, 12, -1, -12],
	},
	{
		name: '2 4 7',
		intervals: [2, 4, 7],
	},
	{
		name: '2 4 7 (long)',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '4 7 12',
		intervals: [4, 7, 12],
	},
	{
		name: '4 7 12 (long)',
		intervals: [4, 7, 12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '4 7 12 -4 -7 -12',
		intervals: [4, 7, 12, -4, -7, -12],
	},
	{
		name: '4 7 12 -4 -7 -12 (long)',
		intervals: [4, 7, 12, -4, -7, -12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 4 7 12 (long)',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '1 2 (long)',
		intervals: [1, 2],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 3 (long)',
		intervals: [2, 3],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'major scale',
		intervals: [2, 4, 5, 7, 9, 11, 12],
	},
	{
		name: 'major scale (long)',
		intervals: [2, 4, 5, 7, 9, 11, 12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'major scale in both directions',
		intervals: [2, 4, 5, 7, 9, 11, 12, -1, -3, -5, -7, -8, -10, -12],
	},
	{
		name: 'major scale in both directions (long)',
		intervals: [2, 4, 5, 7, 9, 11, 12, -1, -3, -5, -7, -8, -10, -12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'major scale up two octaves',
		intervals: [2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24],
	},
	{
		name: 'major scale up two octaves (long)',
		intervals: [2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
].map((d) => ({...BASE_LEVEL_DEF, ...d, id: create_id()}));

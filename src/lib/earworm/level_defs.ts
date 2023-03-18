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
		name: '1 12',
		intervals: [1, 12],
	},
	{
		name: '1 12 -1 -12',
		intervals: [1, 12, -1, -12],
	},
	{
		name: '2 7',
		intervals: [2, 7],
	},
	{
		name: '2 4',
		intervals: [2, 4],
	},
	{
		name: '4 7',
		intervals: [4, 7],
	},
	{
		name: '4 12',
		intervals: [4, 12],
	},
	{
		name: '7 12',
		intervals: [7, 12],
	},
	{
		name: '2 4 7',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '4 7 12',
		intervals: [4, 7, 12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 4 7 12',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '4 7 12 -4 -7 -12',
		intervals: [4, 7, 12, -4, -7, -12],
	},
	{
		name: '1 2',
		intervals: [1, 2],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 3',
		intervals: [2, 3],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'one full octave',
		intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	},
	{
		name: 'one full octave in both directions',
		intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12], // prettier-ignore
	},
].map((d) => ({...BASE_LEVEL_DEF, ...d, id: create_id()}));

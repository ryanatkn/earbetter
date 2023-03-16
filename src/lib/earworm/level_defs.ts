import type {LevelDef} from '$lib/earworm/level';

const base_level_def = {
	// TODO support something like this for 3-star accomplishment (or N-star)
	// we probably additionally want to say for each version not just the number of trials,
	// but the number of trials that must be correct to count as success (which should probably be 0 for the first level!)
	// trial_count: [2, 5, 25],
	trial_count: 2,
	midi_min: 48,
	midi_max: 84,
	octave_shift_min: 0,
	octave_shift_max: 0,
	sequence_length: 2,
} as const;

export const level_defs: LevelDef[] = [
	{
		id: '2,7',
		...base_level_def,
		intervals: [2, 7],
	},
	{
		id: '4,7',
		...base_level_def,
		intervals: [4, 7],
	},
	{
		id: '2,4,7',
		...base_level_def,
		intervals: [2, 4, 7],
		unlock: ['2,7', '4,7'], // TODO rename
	},
	{
		id: '2,4,7-b',
		...base_level_def,
		intervals: [2, 4, 7],
		unlock: ['2,4,7'], // TODO rename
		octave_shift_min: -1,
		octave_shift_max: 0,
	},
	{
		id: '2,4,7-c',
		...base_level_def,
		intervals: [2, 4, 7],
		unlock: ['2,4,7'], // TODO rename
		octave_shift_min: -1,
		octave_shift_max: 1,
	},
	{
		id: '7,12',
		...base_level_def,
		intervals: [7, 12],
		unlock: ['4,7'], // TODO rename
	},
	{
		id: '4,7,12',
		...base_level_def,
		sequence_length: 2,
		intervals: [4, 7, 12],
		unlock: ['4,7'], // TODO rename
	},
];

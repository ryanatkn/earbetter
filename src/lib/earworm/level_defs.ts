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

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

export const level_defs: LevelDef[] = [
	{
		name: 'perfect fourth vs perfect octave',
		intervals: [5, 12],
		sequence_length: 2,
		// TODO I think this would be best as multiple levels within the above name,
		// so you can start simple, then add 2 variants, double the sequence length and "up and down",
		// then both at once for the finale
	},
	{
		name: 'major third vs perfect fifth',
		intervals: [4, 7],
		sequence_length: 2,
	},
	{
		name: 'major third vs perfect fourth vs perfect fifth',
		intervals: [4, 5, 7],
		sequence_length: 2,
	},
	{
		name: 'major second vs major third',
		intervals: [2, 4],
		// TODO BLOCK variants: ['up_and_down']
		// {up_and_down: {options}} (allows options)
		// {type: 'up_and_down', options}} (allows multiple of each variant with options)
		// or maybe
		// group: 'major second vs major third'
		// or
		// groups: ['major second vs major third']
		// think about:
		// `transform_to_up_and_down(level_def)`
	},
	{
		name: 'major second vs perfect octave up and down',
		intervals: [2, 12, -10, -12],
	},
	{
		name: 'major second vs major third vs perfect fifth',
		intervals: [2, 4, 7],
	},
	{
		name: 'major second vs major third vs perfect fifth (long)',
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
		name: '4 7 12 -5 -8 -12',
		intervals: [4, 7, 12, -5, -8, -12],
	},
	{
		name: '4 7 12 -5 -8 -12 (long)',
		intervals: [4, 7, 12, -5, -8, -12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 4 7 12 (long)',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 4 (long)',
		intervals: [2, 4],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: '2 4 5 (long)',
		intervals: [2, 4, 5],
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
	{
		name: 'two octaves',
		intervals: Array.from({length: 25}, (_, i) => i - 12),
	},
	{
		name: 'four octaves',
		intervals: Array.from({length: 49}, (_, i) => i - 24),
	},
].map((d) => ({...BASE_LEVEL_DEF, ...d, id: create_id()}));

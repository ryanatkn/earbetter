import {
	create_level_def,
	DEFAULT_SEQUENCE_LENGTH,
	LevelId,
	type LevelDef,
} from '$lib/earbetter/level';

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

// TODO block maybe pass this as a param? awkward as a global, disconnected from the project data
export const default_level_defs: Map<LevelId, LevelDef> = new Map();

// TODO BLOCK probably rethink this caching thing to be plain data without global caching
export const create_and_cache_level_def = (
	partial?: Partial<LevelDef>,
	defs = default_level_defs,
): LevelDef => {
	const level = create_level_def(partial);
	defs.set(level.id, level);
	return level;
};

// TODO refactor
[
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
		name: 'major third vs perfect fourth',
		intervals: [4, 5],
		sequence_length: 2,
	},
	{
		name: 'perfect fourth vs perfect fifth',
		intervals: [5, 7],
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
		sequence_length: 2,
		// TODO variants, how to implement?
		// as helper functions?
		// `transform_to_up_and_down(level_def)`
		// `with_up_and_down(level_def)`
		// or as data?
		// ['up_and_down']
		// {up_and_down: {options}} (allows options)
		// {type: 'up_and_down', options}} (allows multiple of each variant with options)
		// or maybe
		// group: 'major second vs major third'
		// or
		// groups: ['major second vs major third']
	},
	{
		name: 'major second vs perfect octave (up and down)',
		intervals: [2, 12, -10, -12],
	},
	{
		name: 'major second vs major third vs perfect fifth',
		intervals: [2, 4, 7],
		sequence_length: 2,
	},
	{
		name: 'major second vs major third vs perfect fifth (long)',
		intervals: [2, 4, 7],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'major third vs perfect fifth vs perfect octave (up and down)',
		intervals: [4, 7, 12, -5, -8, -12],
	},
	{
		name: 'major third vs perfect fifth vs perfect octave (up and down, long)',
		intervals: [4, 7, 12, -5, -8, -12],
		sequence_length: DEFAULT_SEQUENCE_LENGTH * 2,
	},
	{
		name: 'major pentatonic (easy)',
		intervals: [2, 4, 7, 9],
	},
	{
		name: 'minor pentatonic (easy)',
		intervals: [3, 5, 7, 10],
	},
	{
		name: 'major pentatonic',
		intervals: [2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
	},
].forEach((d) => create_and_cache_level_def(d));

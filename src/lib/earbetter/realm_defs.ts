import {create_realm_def, type RealmDef} from '$lib/earbetter/realm';
import {create_and_cache_level_def, lookup_level_by_name} from '$lib/earbetter/level_defs';
import {DEFAULT_NOTE_MIN} from '$lib/earbetter/level';
import type {Midi} from '$lib/music/midi';

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

// TODO BLOCK probably allow these to be partials? at least when defining them
export const default_realm_defs: RealmDef[] = [
	{
		name: 'major pentatonic',
		levels: [
			lookup_level_by_name('perfect fourth vs perfect octave').id,
			lookup_level_by_name('major third vs perfect fifth').id,
			lookup_level_by_name('major third vs perfect fourth vs perfect fifth').id,
			lookup_level_by_name('major second vs major third').id,
			lookup_level_by_name('major pentatonic (easy)').id,
			lookup_level_by_name('major pentatonic').id,
		],
	},
	{
		name: 'minor pentatonic',
		levels: [
			lookup_level_by_name('minor pentatonic (easy)').id,
			lookup_level_by_name('minor pentatonic').id,
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
	// 	name: 'perfect fourth vs perfect fifth',
	// 	levels: [lookup_level('perfect fourth vs perfect fifth').id],
	// },
	// {
	// 	name: 'major third vs perfect fourth vs perfect fifth',
	// 	levels: [lookup_level('major third vs perfect fourth vs perfect fifth').id],
	// },
	// TODO more - modes, particular intervals, scales, chromatic, ...?
	// what's best for learning and understanding and covering the landscape?
].map((d) => create_realm_def(d));

console.log(`default_realm_defs`, default_realm_defs);

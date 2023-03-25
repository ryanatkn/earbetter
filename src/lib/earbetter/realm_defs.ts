import {create_realm_id, type RealmDef} from '$lib/earbetter/realm';
import type {LevelDef} from '$lib/earbetter/level';
import {default_level_defs} from '$lib/earbetter/level_defs';

export const BASE_REALM_DEF = {
	// ?
} satisfies Partial<RealmDef>;

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

const lookup_level = (name: string): LevelDef => {
	const level_def = default_level_defs.find((d) => d.name === name);
	if (!level_def) throw Error('unable to find level with name: ' + name);
	return level_def;
};

// TODO BLOCK probably allow these to be partials? at least when defining them
export const default_realm_defs: RealmDef[] = [
	{
		name: 'major pentatonic',
		levels: [
			lookup_level('perfect fourth vs perfect octave').id,
			lookup_level('major third vs perfect fifth').id,
			lookup_level('major third vs perfect fourth vs perfect fifth').id,
			lookup_level('major second vs major third').id,
			lookup_level('major pentatonic (easy)').id,
			lookup_level('major pentatonic').id,
		],
	},
	{
		name: 'minor pentatonic',
		levels: [lookup_level('minor pentatonic (easy)').id, lookup_level('minor pentatonic').id],
	},
	// TODO maybe combine these into a single realm?
	{
		name: 'major third vs perfect fourth',
		levels: [lookup_level('major third vs perfect fourth').id],
	},
	{
		name: 'perfect fourth vs perfect fifth',
		levels: [lookup_level('perfect fourth vs perfect fifth').id],
	},
	{
		name: 'major third vs perfect fourth vs perfect fifth',
		levels: [lookup_level('major third vs perfect fourth vs perfect fifth').id],
	},
	// TODO more - modes, particular intervals, scales, chromatic, ...?
	// what's best for learning and understanding and covering the landscape?
].map((d) => ({...BASE_REALM_DEF, ...d, id: create_realm_id()}));

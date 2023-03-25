import {create_realm_id, type RealmDef} from '$lib/earbetter/realm';

export const BASE_REALM_DEF = {
	// ?
} satisfies Partial<RealmDef>;

// TODO programmatic dimensions
// "up and down" (duplicate the intervals below the tonic)
// "long" (sequent_length multiplier)
// which keys can be used
// present_duration

export const default_realm_defs: RealmDef[] = [
	{
		name: 'major pentatonic',
		levels: [],
	},
	{
		name: 'minor pentatonic',
		levels: [],
	},
	// TODO maybe combine these into a single realm?
	{
		name: 'major third vs perfect fourth',
		levels: [],
	},
	{
		name: 'perfect fourth vs perfect fifth',
		levels: [],
	},
	{
		name: 'major third vs perfect fourth vs perfect fifth',
		levels: [],
	},
	// TODO more - modes, particular intervals, scales, chromatic, ...?
	// what's best for learning and understanding and covering the landscape?
].map((d) => ({...BASE_REALM_DEF, ...d, id: create_realm_id()}));

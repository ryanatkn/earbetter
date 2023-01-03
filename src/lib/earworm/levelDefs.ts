import type {LevelDef} from '$lib/earworm/level';

const baseLevelDef = {
	// TODO support something like this for 3-star accomplishment (or N-star)
	// we probably additionally want to say for each version not just the number of trials,
	// but the number of trials that must be correct to count as success (which should probably be 0 for the first level!)
	// trialCount: [2, 5, 25],
	trialCount: 2,
	midiMin: 46,
	midiMax: 84,
	octaveShiftMin: 0,
	octaveShiftMax: 0,
	sequenceLength: 2,
} as const;

export const levelDefs: LevelDef[] = [
	{
		id: '2,7',
		...baseLevelDef,
		intervals: [2, 7],
		x: 100,
		y: 300,
	},
	{
		id: '4,7',
		...baseLevelDef,
		intervals: [4, 7],
		x: 250,
		y: 300,
	},
	{
		id: '2,4,7',
		...baseLevelDef,
		intervals: [2, 4, 7],
		x: 175,
		y: 175,
		unlock: ['2,7', '4,7'], // TODO rename
	},
	{
		id: '2,4,7-b',
		...baseLevelDef,
		intervals: [2, 4, 7],
		x: 350,
		y: 175,
		unlock: ['2,4,7'], // TODO rename
		octaveShiftMin: -1,
		octaveShiftMax: 0,
	},
	{
		id: '2,4,7-c',
		...baseLevelDef,
		intervals: [2, 4, 7],
		x: 500,
		y: 175,
		unlock: ['2,4,7'], // TODO rename
		octaveShiftMin: -1,
		octaveShiftMax: 1,
	},
	{
		id: '7,12',
		...baseLevelDef,
		intervals: [7, 12],
		x: 300,
		y: 500,
		unlock: ['4,7'], // TODO rename
	},
	{
		id: '4,7,12',
		...baseLevelDef,
		sequenceLength: 2,
		intervals: [4, 7, 12],
		x: 400,
		y: 600,
		unlock: ['4,7'], // TODO rename
	},
];

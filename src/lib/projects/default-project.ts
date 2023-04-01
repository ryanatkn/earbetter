import {RealmDef} from '$lib/earbetter/realm';
import {LevelDef, DEFAULT_NOTE_MIN} from '$lib/earbetter/level';
import {create_project_id, ProjectDef} from '$lib/earbetter/project';
import {lookup_scale, to_scale_notes} from '$lib/music/music';

// TODO more - modes, particular intervals, scales, chromatic, ...?
// what's best for learning and understanding and covering the landscape?

const def = (): ProjectDef =>
	ProjectDef.parse({
		id: create_project_id(),
		realm_defs: [
			{
				name: 'major pentatonic',
				level_defs: [
					{
						name: 'major second vs perfect fifth',
						intervals: [2, 7],
						sequence_length: 2,
					},
					{
						name: 'major second vs major third',
						intervals: [2, 4],
						sequence_length: 2,
					},
					{
						name: 'major third vs perfect fifth',
						intervals: [4, 7],
						sequence_length: 2,
					},
					{
						name: 'perfect fifth vs major sixth',
						intervals: [7, 9],
						sequence_length: 2,
					},
					{
						name: 'one octave',
						intervals: lookup_scale('pentatonic').notes,
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 2),
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 4),
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: lookup_scale('pentatonic').notes,
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 2),
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 4),
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: lookup_scale('pentatonic').notes,
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 2),
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('pentatonic'), 4),
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
			{
				name: 'major scale',
				level_defs: [
					{
						name: 'major second vs major third',
						intervals: [2, 4],
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
						name: 'perfect fifth vs major sixth',
						intervals: [7, 9],
						sequence_length: 2,
					},
					{
						name: 'major sixth vs major seventh',
						intervals: [9, 11],
						sequence_length: 2,
					},
					{
						name: 'one octave',
						intervals: lookup_scale('major').notes,
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: to_scale_notes(lookup_scale('major'), 2),
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: to_scale_notes(lookup_scale('major'), 4),
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: lookup_scale('major').notes,
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('major'), 2),
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('major'), 4),
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: lookup_scale('major').notes,
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('major'), 2),
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('major'), 4),
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
			{
				name: 'minor scale',
				level_defs: [
					// TODO maybe arrange these by difficulty?
					{
						name: 'major second vs minor third',
						intervals: [2, 3],
						sequence_length: 2,
					},
					{
						name: 'minor third vs perfect fourth',
						intervals: [3, 5],
						sequence_length: 2,
					},
					{
						name: 'perfect fourth vs perfect fifth',
						intervals: [5, 7],
						sequence_length: 2,
					},
					{
						name: 'perfect fifth vs minor sixth',
						intervals: [7, 8],
						sequence_length: 2,
					},
					{
						name: 'minor sixth vs minor seventh',
						intervals: [8, 10],
						sequence_length: 2,
					},
					{
						name: 'one octave',
						intervals: [2, 3, 5, 7, 8, 10],
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12],
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12, 14, 15, 17, 19, 20, 22, 24, -24, -22, -21, -19, -17, -16, -14], // prettier-ignore
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: [2, 3, 5, 7, 8, 10],
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12],
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12, 14, 15, 17, 19, 20, 22, 24, -24, -22, -21, -19, -17, -16, -14], // prettier-ignore
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: [2, 3, 5, 7, 8, 10],
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12],
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12, 14, 15, 17, 19, 20, 22, 24, -24, -22, -21, -19, -17, -16, -14], // prettier-ignore
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
			// TODO this will change, just including to see where to go next
			{
				name: 'major third vs perfect fourth',
				level_defs: [
					{
						name: 'one octave',
						sequence_length: 2,
						intervals: [4, 5],
					},
					{
						name: 'two octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7],
					},
					{
						name: 'four octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7, 16, 17, -20, -19],
						note_min: DEFAULT_NOTE_MIN - 12,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: [4, 5, -8, -7],
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: [4, 5, -8, -7, 16, 17, -20, -19],
						sequence_length: 4,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: [4, 5, -8, -7],
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: [4, 5, -8, -7, 16, 17, -20, -19],
						sequence_length: 8,
					},
				].map((v) => LevelDef.parse(v)),
			},
		].map((v) => RealmDef.parse(v)),
	});

export default def;

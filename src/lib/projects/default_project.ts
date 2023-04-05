import {RealmData} from '$lib/earbetter/realm';
import {LevelData, DEFAULT_NOTE_MIN} from '$lib/earbetter/level';
import {create_project_id, ProjectData} from '$lib/earbetter/project';
import {lookup_scale, to_scale_notes} from '$lib/music/music';

// TODO more - modes, particular intervals, scales, chromatic, ...?
// what's best for learning and understanding and covering the landscape?

const data = (): ProjectData =>
	ProjectData.parse({
		id: create_project_id(),
		realms: [
			{
				name: 'major pentatonic',
				levels: [
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
						intervals: lookup_scale('major pentatonic').notes,
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 2),
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 4),
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: lookup_scale('major pentatonic').notes,
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 2),
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 4),
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: lookup_scale('major pentatonic').notes,
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 2),
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('major pentatonic'), 4),
						sequence_length: 8,
					},
				].map((v) => LevelData.parse(v)),
			},
			{
				name: 'major scale (Ionian)',
				levels: [
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
				].map((v) => LevelData.parse(v)),
			},
			{
				name: 'minor scale (Aeolian)',
				levels: [
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
						intervals: to_scale_notes(lookup_scale('minor'), 1),
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: to_scale_notes(lookup_scale('minor'), 2),
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: to_scale_notes(lookup_scale('minor'), 4),
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 1),
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 2),
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 4),
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 1),
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 2),
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('minor'), 4),
						sequence_length: 8,
					},
				].map((v) => LevelData.parse(v)),
			},
			{
				name: 'Dorian',
				levels: [
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
						name: 'perfect fifth vs major sixth',
						intervals: [7, 9],
						sequence_length: 2,
					},
					{
						name: 'major sixth vs minor seventh',
						intervals: [9, 10],
						sequence_length: 2,
					},
					{
						name: 'one octave',
						intervals: to_scale_notes(lookup_scale('Dorian'), 1),
						sequence_length: 2,
					},
					{
						name: 'two octaves',
						intervals: to_scale_notes(lookup_scale('Dorian'), 2),
						sequence_length: 2,
					},
					{
						name: 'four octaves',
						intervals: to_scale_notes(lookup_scale('Dorian'), 4),
						sequence_length: 2,
					},
					{
						name: 'one octave (4 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 1),
						sequence_length: 4,
					},
					{
						name: 'two octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 2),
						sequence_length: 4,
					},
					{
						name: 'four octaves (4 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 4),
						sequence_length: 4,
					},
					{
						name: 'one octave (8 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 1),
						sequence_length: 8,
					},
					{
						name: 'two octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 2),
						sequence_length: 8,
					},
					{
						name: 'four octaves (8 notes)',
						intervals: to_scale_notes(lookup_scale('Dorian'), 4),
						sequence_length: 8,
					},
				].map((v) => LevelData.parse(v)),
			},
			// TODO this will change, just including to see where to go next
			{
				name: 'major third vs perfect fourth',
				levels: [
					{
						name: 'one octave',
						sequence_length: 2,
						intervals: [4, 5],
					},
					{
						name: 'one octave down',
						sequence_length: 2,
						intervals: [-8, -7],
					},
					{
						name: 'two octaves',
						sequence_length: 2,
						intervals: [4, 5, -8, -7],
					},
					{
						name: 'two octaves down',
						sequence_length: 2,
						intervals: [-8, -7, -20, -19],
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
				].map((v) => LevelData.parse(v)),
			},
		].map((v) => RealmData.parse(v)),
	});

export default data;

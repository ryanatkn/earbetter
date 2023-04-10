import {DEFAULT_NOTE_MIN} from '$lib/earbetter/level';
import {ProjectData} from '$lib/earbetter/project';
import {to_default_scale_realm} from '$lib/earbetter/realm_helpers';

const data = (): ProjectData =>
	ProjectData.parse({
		realms: [
			to_default_scale_realm('major pentatonic'),
			to_default_scale_realm('major', 'major scale (Ionian)'),
			to_default_scale_realm('minor', 'minor scale (Aeolian)'),
			to_default_scale_realm('Dorian'),
			to_default_scale_realm('Phrygian'),
			to_default_scale_realm('Lydian'),
			to_default_scale_realm('Mixolydian'),
			to_default_scale_realm('Locrian'),
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
				],
			},
		],
	});

export default data;

import {DEFAULT_MIN_NOTE} from '$lib/earbetter/level.js';
import {Project_Data} from '$lib/earbetter/project.js';
import {to_default_scale_realm} from '$lib/earbetter/realm_helpers.js';

const data = (): Project_Data =>
	Project_Data.parse({
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
						min_note: DEFAULT_MIN_NOTE - 12,
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

import * as s from '@fuzdev/fuz_schema/schema.ts';
import { DEFAULT_MIN_NOTE } from '../earbetter/level.svelte.ts';
import { ProjectData } from '../earbetter/project.ts';
import { to_default_scale_realm } from '../earbetter/realm_helpers.ts';

const data = (): ProjectData =>
	s.parse_or_throw(ProjectData, {
		realms: [
			to_default_scale_realm('major pentatonic'),
			to_default_scale_realm('major', 'major scale (Ionian)'),
			to_default_scale_realm('minor', 'minor scale (Aeolian)'),
			to_default_scale_realm('chromatic'),
			to_default_scale_realm('Dorian'),
			to_default_scale_realm('Phrygian'),
			to_default_scale_realm('Lydian'),
			to_default_scale_realm('Mixolydian'),
			to_default_scale_realm('Locrian'),
			// TODO this will change, just including to see where to go next
			{
				name: 'major second vs perfect fifth (easier for learning the tool)',
				levels: [
					{
						name: 'one octave',
						sequence_length: 2,
						intervals: [2, 7]
					},
					{
						name: 'one octave (downward)',
						sequence_length: 2,
						intervals: [-10, -5]
					},
					{
						name: 'two octaves',
						sequence_length: 2,
						intervals: [2, 7, -10, -5]
					},
					{
						name: 'two octaves (downward)',
						sequence_length: 2,
						intervals: [-10, -5, -22, -17]
					},
					{
						name: 'four octaves',
						sequence_length: 2,
						intervals: [2, 7, -10, -5, 14, 19, -22, -17],
						min_note: DEFAULT_MIN_NOTE - 12
					},
					{
						name: 'two octaves (4 notes)',
						intervals: [2, 7, -10, -5],
						sequence_length: 4
					},
					{
						name: 'four octaves (4 notes)',
						intervals: [2, 7, -10, -5, 14, 19, -22, -17],
						sequence_length: 4
					},
					{
						name: 'two octaves (8 notes)',
						intervals: [2, 7, -10, -5],
						sequence_length: 8
					},
					{
						name: 'four octaves (8 notes)',
						intervals: [2, 7, -10, -5, 14, 19, -22, -17],
						sequence_length: 8
					}
				]
			}
		]
	});

export default data;

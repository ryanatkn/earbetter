import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {lookup_scale, to_scale_notes} from '$lib/music';

test('to_scale_notes', () => {
	assert.equal(to_scale_notes(lookup_scale('major pentatonic'), 1), [2, 4, 7, 9, 12]);
	assert.equal(
		to_scale_notes(lookup_scale('major pentatonic'), 2),
		[2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
	);
	assert.equal(
		to_scale_notes(lookup_scale('major pentatonic'), 4),
		[2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24, -22, -20, -17, -15, -24],
	);
	assert.equal(
		to_scale_notes(lookup_scale('major'), 2),
		[2, 4, 5, 7, 9, 11, 12, -10, -8, -7, -5, -3, -1, -12],
	);
	assert.equal(
		to_scale_notes(lookup_scale('major'), 4),
		[2, 4, 5, 7, 9, 11, 12, -10, -8, -7, -5, -3, -1, -12, 14, 16, 17, 19, 21, 23, 24, -22, -20, -19, -17, -15, -13, -24], // prettier-ignore
	);
	assert.equal(to_scale_notes(lookup_scale('minor'), 1), [2, 3, 5, 7, 8, 10, 12]);
	assert.equal(
		to_scale_notes(lookup_scale('minor'), 2),
		[2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12],
	);
	assert.equal(
		to_scale_notes(lookup_scale('minor'), 4),
		[2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12, 14, 15, 17, 19, 20, 22, 24, -22, -21, -19, -17, -16, -14,-24], // prettier-ignore
	);
});

test.run();

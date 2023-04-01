import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {lookup_scale, to_scale_notes} from '$lib/music/music';

test('to_scale_notes', () => {
	assert.equal(to_scale_notes(lookup_scale('pentatonic'), 1), [2, 4, 7, 9, 12]);
	assert.equal(
		to_scale_notes(lookup_scale('pentatonic'), 2),
		[2, 4, 7, 9, 12, -10, -8, -5, -3, -12],
	);
	assert.equal(
		to_scale_notes(lookup_scale('pentatonic'), 4),
		[2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24, -22, -20, -17, -15, -24],
	);
	assert.equal(
		to_scale_notes(lookup_scale('major'), 2),
		[2, 4, 5, 7, 9, 11, 12, -10, -8, -7, -5, -3, -1, -12],
	);
});

test.run();

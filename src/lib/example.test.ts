import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {a} from '$lib/index';

test('everything looks good', () => {
	assert.is(a, 5);
});

test.run();

import { test, assert } from 'vitest';

import { to_next_name } from '#lib/entity.ts';

const cases: Array<[label: string, name: string, existing: Array<string>, expected: string]> = [
	['unused', 'a', ['b'], 'a'],
	['empty list', 'a', [], 'a'],
	['taken', 'a', ['a'], 'a_'],
	['taken repeatedly', 'a', ['a', 'a_', 'a__'], 'a___'],
	['gap', 'a', ['a', 'a__'], 'a_']
];
test.each(cases)('%s', (_label, name, existing, expected) => {
	assert.strictEqual(
		to_next_name(
			name,
			existing.map((n) => ({ name: n }))
		),
		expected
	);
});

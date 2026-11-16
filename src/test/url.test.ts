import { test, assert } from 'vitest';

import { parse_from_hash, serialize_to_hash } from '#lib/url.ts';

test('round-trips data through a hash', () => {
	const data = { a: 1, b: [null, 'x'], c: { nested: true } };
	assert.deepEqual(parse_from_hash(serialize_to_hash(data)), data);
});

test('round-trips characters that need encoding', () => {
	const data = { text: 'C♯ & D♭ # 100% "quoted" 🦜' };
	const hash = serialize_to_hash(data);
	assert.ok(hash.startsWith('#'));
	assert.notInclude(hash.slice(1), '#');
	assert.deepEqual(parse_from_hash(hash), data);
});

test('returns null for an empty hash', () => {
	assert.strictEqual(parse_from_hash(''), null);
});

test('returns null for malformed data', () => {
	assert.strictEqual(parse_from_hash('#not-json'), null);
	assert.strictEqual(parse_from_hash('#%E0%A4%A'), null); // malformed URI
});

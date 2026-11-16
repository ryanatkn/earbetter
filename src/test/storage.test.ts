import { describe, test, assert, vi, beforeEach, afterEach } from 'vitest';

import { load_from_storage, set_in_storage } from '#lib/storage.ts';
import { create_memory_storage } from './test_helpers.ts';

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
});
afterEach(() => {
	vi.unstubAllGlobals();
});

const parse_number = (value: unknown): number => {
	if (typeof value !== 'number') throw Error('not a number');
	return value;
};

describe('load_from_storage', () => {
	test('returns the default when nothing is stored', () => {
		assert.strictEqual(load_from_storage('k', 5, parse_number), 5);
	});

	test('calls a lazy default only when needed', () => {
		const fallback = vi.fn(() => 5);
		assert.strictEqual(load_from_storage('k', fallback, parse_number), 5);
		localStorage.setItem('k', '7');
		assert.strictEqual(load_from_storage('k', fallback, parse_number), 7);
		assert.strictEqual(fallback.mock.calls.length, 1);
	});

	test('parses the stored JSON', () => {
		localStorage.setItem('k', '{"a":[1]}');
		assert.deepEqual(
			load_from_storage('k', null, (v) => v),
			{ a: [1] }
		);
	});

	test('removes a value that fails to parse and returns the default', () => {
		localStorage.setItem('k', '"text"');
		assert.strictEqual(load_from_storage('k', 5, parse_number), 5);
		assert.strictEqual(localStorage.getItem('k'), null);
	});

	test('removes invalid JSON and returns the default', () => {
		localStorage.setItem('k', '{');
		assert.strictEqual(load_from_storage('k', 5, parse_number), 5);
		assert.strictEqual(localStorage.getItem('k'), null);
	});
});

describe('set_in_storage', () => {
	test('round-trips with load_from_storage', () => {
		set_in_storage('k', 42);
		assert.strictEqual(load_from_storage('k', 0, parse_number), 42);
	});

	test('stores null', () => {
		set_in_storage('k', null);
		assert.strictEqual(localStorage.getItem('k'), 'null');
	});

	test('removes the key for undefined', () => {
		set_in_storage('k', 1);
		set_in_storage('k', undefined);
		assert.strictEqual(localStorage.getItem('k'), null);
	});
});

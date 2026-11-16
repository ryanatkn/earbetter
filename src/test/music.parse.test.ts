import { describe, test, assert } from 'vitest';

import { parse_intervals, parse_notes, serialize_intervals, serialize_notes } from '#lib/music.ts';

describe('parse_intervals', () => {
	const cases: Array<[label: string, input: string, expected: Array<number>]> = [
		['simple', '5, 7', [5, 7]],
		['keeps order', '7, -5, 2', [7, -5, 2]],
		['no spaces', '1,2,3', [1, 2, 3]],
		['dedupes', '3, 3, 4, 3', [3, 4]],
		['drops zero', '0, 2', [2]],
		['drops non-numbers', 'x, 4, , ', [4]],
		['truncates decimals', '3.7', [3]],
		['keeps the midi range', '127, -127', [127, -127]],
		['drops beyond the midi range', '128, -128, 5', [5]],
		['empty', '', []]
	];
	test.each(cases)('%s', (_label, input, expected) => {
		assert.deepEqual(parse_intervals(input), expected);
	});

	test('round-trips with serialize_intervals', () => {
		const intervals = [2, -5, 12, 7];
		assert.strictEqual(serialize_intervals(intervals), '2, -5, 12, 7');
		assert.deepEqual(parse_intervals(serialize_intervals(intervals)), intervals);
	});
});

describe('parse_notes', () => {
	const cases: Array<[label: string, input: string, expected: Array<number>]> = [
		['simple', '60, 64', [60, 64]],
		['sorts', '67, 60, 64', [60, 64, 67]],
		['dedupes', '60, 64, 60', [60, 64]],
		['drops out of range', '-1, 128, 72', [72]],
		['drops non-numbers and blanks', 'C4, , 61', [61]],
		['truncates decimals', '61.9', [61]],
		['empty', '', []]
	];
	test.each(cases)('%s', (_label, input, expected) => {
		assert.deepEqual(parse_notes(input), expected);
	});

	test('serialize_notes handles null', () => {
		assert.strictEqual(serialize_notes(null), '');
		assert.strictEqual(serialize_notes([48, 60]), '48, 60');
	});

	test('round-trips sorted unique notes', () => {
		const notes = [21, 48, 60, 108];
		assert.deepEqual(parse_notes(serialize_notes(notes)), notes);
	});
});

import {describe, test, assert} from 'vitest';

import {
	add_mistakes,
	add_mistakes_to_level_stats,
	DEFAULT_INTERVALS,
	DEFAULT_LEVEL_NAME,
	DEFAULT_LEVEL_STATS,
	DEFAULT_MAX_NOTE,
	DEFAULT_MIN_NOTE,
	Level_Data,
	Level_Hash_Data,
	Level_Stats,
	MISTAKE_HISTORY_LENGTH,
	to_level_url,
} from '$lib/earbetter/level.svelte.js';
import {parse_from_hash} from '$lib/url.js';

describe('Level_Data', () => {
	test('fills defaults', () => {
		const level = Level_Data.parse({});
		assert.ok(level.id.length > 0);
		assert.strictEqual(level.name, DEFAULT_LEVEL_NAME);
		assert.deepEqual(level.intervals, DEFAULT_INTERVALS);
		assert.strictEqual(level.tonics, null);
		assert.strictEqual(level.min_note, DEFAULT_MIN_NOTE);
		assert.strictEqual(level.max_note, DEFAULT_MAX_NOTE);
	});

	test('generates distinct ids', () => {
		assert.notStrictEqual(Level_Data.parse({}).id, Level_Data.parse({}).id);
	});

	test('parsing is idempotent through JSON', () => {
		const level = Level_Data.parse({name: 'x', intervals: [3, -4], tonics: [60, 62]});
		assert.deepEqual(Level_Data.parse(JSON.parse(JSON.stringify(level))), level);
	});

	const invalid: Array<[label: string, input: object]> = [
		['empty name', {name: ''}],
		['note above midi', {max_note: 128}],
		['negative note', {min_note: -1}],
		['fractional interval', {intervals: [1.5]}],
		['tonic out of range', {tonics: [200]}],
	];
	test.each(invalid)('rejects %s', (_label, input) => {
		assert.ok(!Level_Data.safeParse(input).success);
	});
});

describe('to_level_url', () => {
	test('round-trips the level through the hash', () => {
		const level = Level_Data.parse({name: 'C♯ & friends', intervals: [1, 6]});
		const url = to_level_url(level);
		const hash_index = url.indexOf('#');
		assert.ok(url.slice(0, hash_index).endsWith('/trainer/level'));
		const parsed = Level_Hash_Data.parse(parse_from_hash(url.slice(hash_index)));
		assert.deepEqual(parsed.level, level);
	});
});

describe('add_mistakes', () => {
	test('appends until the history is full', () => {
		let history: Array<number> | undefined;
		for (const m of [5, 3, 7]) history = add_mistakes(history, m);
		assert.deepEqual(history, [5, 3, 7]);
	});

	test('keeps the best runs once full', () => {
		let history: Array<number> | undefined;
		for (const m of [5, 3, 7, 1, 2, 9, 0]) history = add_mistakes(history, m);
		assert.ok(history);
		assert.strictEqual(history.length, MISTAKE_HISTORY_LENGTH);
		assert.deepEqual(
			history.toSorted((a, b) => a - b),
			[0, 1, 2, 3],
		);
	});

	test('keeps the best runs for any order', () => {
		const runs = [4, 8, 0, 6, 2, 9, 1, 7, 3, 5];
		for (let shift = 0; shift < runs.length; shift++) {
			const ordered = [...runs.slice(shift), ...runs.slice(0, shift)];
			let history: Array<number> | undefined;
			for (const m of ordered) history = add_mistakes(history, m);
			assert.deepEqual(
				history?.toSorted((a, b) => a - b),
				[0, 1, 2, 3],
				ordered.join(),
			);
		}
	});

	test('does not mutate the input', () => {
		const history = [4, 3, 2, 1];
		add_mistakes(history, 0);
		assert.deepEqual(history, [4, 3, 2, 1]);
	});
});

describe('add_mistakes_to_level_stats', () => {
	test('adds to the level and leaves the input untouched', () => {
		const stats: Level_Stats = {mistakes: {a: [1]}};
		const updated = add_mistakes_to_level_stats(stats, 'b', 2);
		assert.deepEqual(updated, {mistakes: {a: [1], b: [2]}});
		assert.deepEqual(stats, {mistakes: {a: [1]}});
		assert.strictEqual(updated.mistakes.a, stats.mistakes.a);
	});

	test('starts from the default stats', () => {
		const updated = add_mistakes_to_level_stats(DEFAULT_LEVEL_STATS, 'a', 0);
		assert.deepEqual(updated, {mistakes: {a: [0]}});
		assert.deepEqual(DEFAULT_LEVEL_STATS, {mistakes: {}});
	});

	test('the result parses as stats', () => {
		const updated = add_mistakes_to_level_stats(DEFAULT_LEVEL_STATS, 'a', 3);
		assert.deepEqual(Level_Stats.parse(updated), updated);
	});
});

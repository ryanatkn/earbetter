import * as s from '@fuzdev/fuz_schema/schema.ts';
import { describe, test, assert } from 'vitest';
import { create_random_alea } from '@fuzdev/fuz_util/random_alea.ts';

import {
	create_next_trial,
	create_valid_notes,
	get_correct_guess_for_trial,
	get_incorrect_guess_for_trial,
	LevelData,
	to_fallback_tonic,
	to_random_tonic,
	to_note_duration,
	is_usable_tonic,
	to_level_data_error,
	to_usable_tonics,
	DEFAULT_NOTE_DURATION,
	DEFAULT_NOTE_DURATION_2,
	type Trial
} from '#lib/earbetter/level.svelte.ts';
import { create_scripted_random, to_random_for_int } from '../test_helpers.ts';

describe('create_valid_notes', () => {
	test('includes the tonic and its intervals within the range', () => {
		assert.deepEqual(create_valid_notes(60, 48, 84, [5, 7]), [60, 65, 67]);
	});

	test('includes downward intervals', () => {
		assert.deepEqual(create_valid_notes(60, 48, 84, [-5, 7]), [55, 60, 67]);
	});

	test('drops intervals outside the range', () => {
		assert.deepEqual(create_valid_notes(60, 55, 66, [-12, 5, 12]), [60, 65]);
	});

	test('throws when fewer than two notes fit', () => {
		assert.throws(() => create_valid_notes(60, 55, 66, [12]), 'invalid notes');
	});
});

describe('to_random_tonic', () => {
	test('picks from explicit tonics', () => {
		const level = s.parse_or_throw(LevelData, { tonics: [50, 55, 62] });
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0.5])), 55);
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0.99])), 62);
	});

	test('leaves room for every interval', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [-5, 7], min_note: 48, max_note: 84 });
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0])), 53);
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0.9999])), 77);
	});

	test('upward intervals can start at the bottom of the range', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [2, 7], min_note: 48, max_note: 84 });
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0])), 48);
	});

	// regression: a range with exactly one tonic fitting every interval
	// fell back to a middle tonic, which has no room and failed with 'invalid notes'
	test('uses the one tonic that fits', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [12], min_note: 48, max_note: 60 });
		for (const r of [0, 0.5, 0.9999]) {
			assert.strictEqual(to_random_tonic(level, create_scripted_random([r])), 48);
		}
		const trial = create_next_trial(level, null, create_scripted_random([0, 0.9999]));
		assert.deepEqual(trial.sequence, [48, 60]);
	});

	test('falls back to the middle of the range when no tonic fits every interval', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [-12, 12], min_note: 48, max_note: 70 });
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0])), 53);
		assert.strictEqual(to_random_tonic(level, create_scripted_random([0.9999])), 65);
	});
});

describe('to_fallback_tonic', () => {
	test('prefers usable tonics in the middle half', () => {
		// 59 is in the middle but has no interval in range
		const level = s.parse_or_throw(LevelData, { intervals: [-12, 12], min_note: 48, max_note: 70 });
		const middle = [53, 54, 55, 56, 57, 58, 60, 61, 62, 63, 64, 65];
		for (let i = 0; i < middle.length; i++) {
			const r = to_random_for_int(0, middle.length - 1, i);
			assert.strictEqual(to_fallback_tonic(level, create_scripted_random([r])), middle[i]);
		}
	});

	// regression: the fallback picked a middle tonic even when none there was usable
	test('falls back to any usable tonic', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [-30, 30], min_note: 48, max_note: 84 });
		assert.strictEqual(to_fallback_tonic(level, create_scripted_random([0])), 48);
		assert.strictEqual(to_fallback_tonic(level, create_scripted_random([0.9999])), 84);
		const random = create_random_alea('wide');
		for (let i = 0; i < 100; i++) {
			const trial = create_next_trial(level, null, random);
			assert.strictEqual(Math.abs(trial.sequence[1]! - trial.sequence[0]!), 30);
		}
	});

	test('throws when no tonic is usable', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [24], min_note: 48, max_note: 60 });
		assert.throws(() => to_fallback_tonic(level), 'no tonic has an interval');
	});
});

describe('is_usable_tonic', () => {
	const cases: Array<[label: string, tonic: number, intervals: Array<number>, expected: boolean]> =
		[
			['an interval fits upward', 48, [5], true],
			['an interval fits downward', 60, [-12], true],
			['one of several fits', 60, [12, -5], true],
			['none fit', 54, [12, -12], false],
			['only a unison', 54, [0], false],
			['below the range', 47, [5], false],
			['above the range', 61, [-5], false]
		];
	test.each(cases)('%s', (_label, tonic, intervals, expected) => {
		assert.strictEqual(is_usable_tonic(tonic, 48, 60, intervals), expected);
	});
});

describe('to_usable_tonics', () => {
	test('filters the whole range without explicit tonics', () => {
		const level = s.parse_or_throw(LevelData, { intervals: [10], min_note: 48, max_note: 60 });
		assert.deepEqual(to_usable_tonics(level), [48, 49, 50]);
	});

	test('filters explicit tonics', () => {
		const level = s.parse_or_throw(LevelData, {
			intervals: [10],
			tonics: [49, 55],
			min_note: 48,
			max_note: 60
		});
		assert.deepEqual(to_usable_tonics(level), [49]);
	});
});

describe('to_level_data_error', () => {
	const cases: Array<[label: string, input: Partial<LevelData>, expected: string | null]> = [
		['the defaults', {}, null],
		[
			'inverted range',
			{ min_note: 60, max_note: 48 },
			'the lowest note must be lower than the highest'
		],
		[
			'empty range',
			{ min_note: 60, max_note: 60 },
			'the lowest note must be lower than the highest'
		],
		['no intervals', { intervals: [] }, 'add at least one interval'],
		['only a unison', { intervals: [0] }, 'add at least one interval'],
		['zero trials', { trial_count: 0 }, 'the trial count must be a whole number of at least 1'],
		[
			'fractional trials',
			{ trial_count: 1.5 },
			'the trial count must be a whole number of at least 1'
		],
		[
			'one-note sequence',
			{ sequence_length: 1 },
			'the sequence length must be a whole number of at least 2'
		],
		[
			'intervals wider than the range',
			{ intervals: [24], min_note: 48, max_note: 60 },
			'none of the intervals fit within the note range'
		],
		['one interval fits', { intervals: [24, 5], min_note: 48, max_note: 60 }, null],
		[
			'an unusable tonic',
			{ intervals: [12], tonics: [48, 55], min_note: 48, max_note: 60 },
			'the tonic G3 has no intervals within the note range'
		],
		[
			'unusable tonics',
			{ intervals: [12], tonics: [50, 55], min_note: 48, max_note: 60 },
			'the tonics D3, G3 have no intervals within the note range'
		],
		['usable tonics', { intervals: [12, -12], tonics: [48, 60], min_note: 48, max_note: 60 }, null],
		['empty tonics means all', { tonics: [] }, null]
	];
	test.each(cases)('%s', (_label, input, expected) => {
		assert.strictEqual(to_level_data_error(s.parse_or_throw(LevelData, input)), expected);
	});

	test('a level without an error can always start a trial', () => {
		const random = create_random_alea('playable');
		for (let i = 0; i < 500; i++) {
			const min_note = 30 + Math.floor(random() * 40);
			const level = s.parse_or_throw(LevelData, {
				min_note,
				max_note: min_note + 1 + Math.floor(random() * 30),
				intervals: [Math.floor(random() * 49) - 24, Math.floor(random() * 49) - 24]
			});
			if (to_level_data_error(level)) continue;
			create_next_trial(level, null, random);
		}
	});
});

describe('create_next_trial', () => {
	test('starts on the tonic with scripted notes', () => {
		const level = s.parse_or_throw(LevelData, {
			intervals: [5, 7],
			sequence_length: 3,
			tonics: [60]
		});
		// valid notes are [60, 65, 67]: the tonic, then index 2, then index 1
		const random = create_scripted_random([
			0,
			to_random_for_int(0, 2, 2),
			to_random_for_int(0, 2, 1)
		]);
		const trial = create_next_trial(level, null, random);
		assert.deepEqual(trial.sequence, [60, 67, 65]);
		assert.deepEqual([...trial.valid_notes], [60, 65, 67]);
		assert.strictEqual(trial.index, 0);
		assert.strictEqual(trial.presenting_index, null);
		assert.strictEqual(trial.guessing_index, null);
		assert.strictEqual(trial.retry_count, 0);
	});

	test('redraws a note that repeats the previous one', () => {
		const level = s.parse_or_throw(LevelData, {
			intervals: [5, 7],
			sequence_length: 2,
			tonics: [60]
		});
		const random = create_scripted_random([
			0,
			to_random_for_int(0, 2, 0),
			to_random_for_int(0, 2, 0),
			to_random_for_int(0, 2, 1)
		]);
		assert.deepEqual(create_next_trial(level, null, random).sequence, [60, 65]);
	});

	test('increments the index from the current trial', () => {
		const level = s.parse_or_throw(LevelData, { tonics: [60] });
		const first = create_next_trial(level, null, create_random_alea(1));
		const second = create_next_trial(level, first, create_random_alea(2));
		assert.strictEqual(second.index, 1);
	});

	test('is deterministic for a seed', () => {
		const level = s.parse_or_throw(LevelData, {
			intervals: [2, 4, 5, 7, 9, 11, 12],
			sequence_length: 8
		});
		const a = create_next_trial(level, null, create_random_alea('seed'));
		const b = create_next_trial(level, null, create_random_alea('seed'));
		assert.deepEqual(a, b);
	});

	test('invariants hold across many random trials', () => {
		const random = create_random_alea('invariants');
		const levels = [
			s.parse_or_throw(LevelData, {}),
			s.parse_or_throw(LevelData, { intervals: [-12, -5, 7, 12], sequence_length: 6 }),
			s.parse_or_throw(LevelData, {
				intervals: [1],
				sequence_length: 8,
				min_note: 60,
				max_note: 62
			}),
			s.parse_or_throw(LevelData, {
				intervals: [2, 7],
				tonics: [40, 50, 60],
				min_note: 36,
				max_note: 72
			})
		];
		for (const level of levels) {
			const allowed = new Set([0, ...level.intervals]);
			for (let i = 0; i < 200; i++) {
				const { sequence, valid_notes } = create_next_trial(level, null, random);
				const tonic = sequence[0]!;
				assert.strictEqual(sequence.length, level.sequence_length);
				if (level.tonics) assert.include(level.tonics, tonic);
				for (let j = 0; j < sequence.length; j++) {
					const note = sequence[j]!;
					assert.ok(note >= level.min_note && note <= level.max_note);
					assert.ok(valid_notes.has(note));
					assert.ok(allowed.has(note - tonic));
					if (j > 0) assert.notStrictEqual(note, sequence[j - 1]);
				}
			}
		}
	});
});

describe('guess helpers', () => {
	const trial: Trial = {
		index: 0,
		valid_notes: new Set([60, 65, 67]),
		sequence: [60, 67],
		presenting_index: null,
		guessing_index: 1,
		retry_count: 0
	};

	test('the correct guess is the note at the guessing index', () => {
		assert.strictEqual(get_correct_guess_for_trial(trial), 67);
		assert.strictEqual(get_correct_guess_for_trial({ ...trial, guessing_index: 0 }), 60);
	});

	test('no guess without a guessing index', () => {
		assert.strictEqual(get_correct_guess_for_trial(null), null);
		assert.strictEqual(get_correct_guess_for_trial({ ...trial, guessing_index: null }), null);
		assert.strictEqual(get_incorrect_guess_for_trial({ ...trial, guessing_index: null }), null);
	});

	test('an incorrect guess is another valid note', () => {
		const random = create_random_alea('incorrect');
		for (let i = 0; i < 50; i++) {
			const guess = get_incorrect_guess_for_trial(trial, random);
			assert.ok(guess === 60 || guess === 65);
		}
	});

	test('no incorrect guess when every valid note is correct', () => {
		assert.strictEqual(
			get_incorrect_guess_for_trial({ ...trial, valid_notes: new Set([67]) }),
			null
		);
	});
});

describe('to_note_duration', () => {
	test('a single note plays longer', () => {
		assert.strictEqual(to_note_duration(1), DEFAULT_NOTE_DURATION_2);
		assert.strictEqual(to_note_duration(2), DEFAULT_NOTE_DURATION);
		assert.strictEqual(to_note_duration(8), DEFAULT_NOTE_DURATION);
	});
});

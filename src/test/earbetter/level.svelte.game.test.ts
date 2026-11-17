import * as s from '@fuzdev/fuz_schema/schema.ts';
import { describe, test, assert, vi, beforeEach, afterEach } from 'vitest';
import { create_random_alea } from '@fuzdev/fuz_util/random_alea.ts';

import {
	DEFAULT_FEEDBACK_DURATION,
	DEFAULT_NOTE_DURATION,
	Level,
	LevelData,
	type LevelId
} from '#lib/earbetter/level.svelte.ts';
import {
	create_fake_audio_context,
	create_level_audio_state,
	type FakeAudioContext
} from '../test_helpers.ts';

interface LevelHarness {
	level: Level;
	audio: FakeAudioContext;
	successes: Array<[id: LevelId, mistakes: number]>;
}

const create_level = (data: Partial<LevelData> = {}): LevelHarness => {
	const audio = create_fake_audio_context();
	const successes: LevelHarness['successes'] = [];
	const level = new Level(
		create_level_audio_state(),
		s.parse_or_throw(LevelData, {
			id: 'level',
			tonics: [60],
			intervals: [5, 7],
			trial_count: 2,
			...data
		}),
		() => audio.ac,
		(id, mistakes) => successes.push([id, mistakes]),
		create_random_alea('level')
	);
	return { level, audio, successes };
};

/**
 * Advances through the prompt of the current trial.
 */
const finish_prompt = async (level: Level): Promise<void> => {
	assert.strictEqual(level.status, 'presenting_prompt');
	await vi.advanceTimersByTimeAsync(DEFAULT_NOTE_DURATION * level.trial!.sequence.length);
	assert.strictEqual(level.status, 'waiting_for_input');
};

const guess_all = (level: Level): void => {
	for (const note of level.trial!.sequence) level.guess(note);
};

const wrong_note = (level: Level, index: number): number => {
	const { sequence, valid_notes } = level.trial!;
	return [...valid_notes].find((n) => n !== sequence[index])!;
};

beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('Level', () => {
	test('starts by presenting the first trial', async () => {
		const { level, audio } = create_level();
		assert.strictEqual(level.status, 'initial');
		level.start();
		assert.strictEqual(level.status, 'presenting_prompt');
		assert.strictEqual(level.trials.length, 1);
		assert.strictEqual(level.trial?.presenting_index, 0);
		await finish_prompt(level);
		assert.deepEqual(audio.played, level.trial!.sequence);
		assert.strictEqual(level.trial?.presenting_index, null);
		assert.strictEqual(level.trial?.guessing_index, 0);
	});

	test('a level with an error never starts', () => {
		const { level, audio } = create_level({
			intervals: [24],
			tonics: null,
			min_note: 48,
			max_note: 60
		});
		assert.strictEqual(level.error, 'none of the intervals fit within the note range');
		level.start();
		assert.strictEqual(level.status, 'initial');
		assert.strictEqual(level.trial, null);
		assert.deepEqual(audio.played, []);
	});

	test('a playable level has no error', () => {
		assert.strictEqual(create_level().level.error, null);
	});

	test('start is a no-op once started', () => {
		const { level } = create_level();
		level.start();
		level.start();
		assert.strictEqual(level.trials.length, 1);
	});

	test('ignores guesses while presenting', () => {
		const { level } = create_level();
		level.start();
		level.guess(level.trial!.sequence[0]!);
		assert.strictEqual(level.trial?.guessing_index, 0);
		assert.strictEqual(level.last_guess, null);
	});

	test('correct guesses complete the level without mistakes', async () => {
		const { level, successes } = create_level();
		level.start();
		await finish_prompt(level);
		guess_all(level);
		assert.strictEqual(level.status, 'showing_success_feedback');
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(level.trials.length, 2);
		assert.strictEqual(level.trial?.index, 1);
		await finish_prompt(level);
		guess_all(level);
		assert.deepEqual(successes, []);
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(level.status, 'complete');
		assert.strictEqual(level.trial, null);
		assert.deepEqual(successes, [['level', 0]]);
	});

	test('a correct guess advances the guessing index', async () => {
		const { level } = create_level({ sequence_length: 3 });
		level.start();
		await finish_prompt(level);
		level.guess(level.trial!.sequence[0]!);
		level.guess(level.trial!.sequence[1]!);
		assert.strictEqual(level.trial?.guessing_index, 2);
		assert.strictEqual(level.status, 'waiting_for_input');
	});

	test('a wrong first note is free', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		const wrong = wrong_note(level, 0);
		level.guess(wrong);
		assert.strictEqual(level.mistakes, 0);
		assert.strictEqual(level.status, 'waiting_for_input');
		assert.strictEqual(level.last_guess, wrong);
	});

	test('a note outside the valid notes is free', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		level.guess(level.trial!.sequence[0]!);
		level.guess(61);
		assert.strictEqual(level.mistakes, 0);
		assert.strictEqual(level.status, 'waiting_for_input');
	});

	test('a wrong later note counts a mistake and replays the trial', async () => {
		const { level, audio, successes } = create_level({ trial_count: 1 });
		level.start();
		await finish_prompt(level);
		const { sequence } = level.trial!;
		level.guess(sequence[0]!);
		level.guess(wrong_note(level, 1));
		assert.strictEqual(level.mistakes, 1);
		assert.strictEqual(level.status, 'showing_failure_feedback');
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(level.trial?.retry_count, 1);
		await finish_prompt(level);
		assert.deepEqual(audio.played.slice(-sequence.length), sequence);
		assert.strictEqual(level.trial?.guessing_index, 0);
		guess_all(level);
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.deepEqual(successes, [['level', 1]]);
	});

	test('feedback records each judged guess and outlives its status', async () => {
		const { level } = create_level();
		level.start();
		assert.strictEqual(level.feedback, null);
		await finish_prompt(level);
		const wrong = wrong_note(level, 0);
		level.guess(wrong);
		assert.strictEqual(level.feedback, null, 'a free guess is not judged');
		const { sequence } = level.trial!;
		level.guess(sequence[0]!);
		level.guess(wrong_note(level, 1));
		const failure = level.feedback;
		assert.deepEqual(failure, { kind: 'failure', note: wrong_note(level, 1) });
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(level.feedback, failure, 'kept after the status moves on');
		await finish_prompt(level);
		guess_all(level);
		assert.deepEqual(level.feedback, { kind: 'success', note: sequence.at(-1) });
	});

	test('repeated feedback of the same kind is a new event', async () => {
		const { level } = create_level({ trial_count: 2 });
		level.start();
		await finish_prompt(level);
		guess_all(level);
		const first = level.feedback;
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		await finish_prompt(level);
		guess_all(level);
		assert.strictEqual(level.feedback?.kind, 'success');
		assert.notStrictEqual(level.feedback, first);
	});

	test('reset clears the feedback', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		guess_all(level);
		assert.ok(level.feedback);
		level.reset();
		assert.strictEqual(level.feedback, null);
	});

	test('retry replays the current trial', async () => {
		const { level, audio } = create_level();
		level.start();
		await finish_prompt(level);
		const played = audio.played.length;
		level.retry_trial();
		await finish_prompt(level);
		assert.strictEqual(level.trial?.retry_count, 1);
		assert.strictEqual(level.trials.length, 1);
		assert.deepEqual(audio.played.slice(played), level.trial!.sequence);
	});

	test('retry is ignored while presenting', () => {
		const { level } = create_level();
		level.start();
		level.retry_trial();
		assert.strictEqual(level.trial?.retry_count, 0);
	});

	// regression: the scheduled retry also fired after a manual one, replaying twice
	test('a manual retry during failure feedback replaces the scheduled one', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		level.guess(level.trial!.sequence[0]!);
		level.guess(wrong_note(level, 1));
		level.retry_trial();
		await finish_prompt(level);
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION * 2);
		assert.strictEqual(level.trial?.retry_count, 1);
		assert.strictEqual(level.status, 'waiting_for_input');
	});

	// regression: the pending transition from before the reset added a stale trial
	test('reset during success feedback starts over cleanly', async () => {
		const { level } = create_level({ trial_count: 3 });
		level.start();
		await finish_prompt(level);
		guess_all(level);
		assert.strictEqual(level.status, 'showing_success_feedback');
		level.reset();
		assert.strictEqual(level.trials.length, 1);
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION * 2);
		assert.strictEqual(level.trials.length, 1);
		assert.strictEqual(level.trial?.index, 0);
		assert.strictEqual(level.status, 'waiting_for_input');
	});

	test('reset clears mistakes from the previous run', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		level.guess(level.trial!.sequence[0]!);
		level.guess(wrong_note(level, 1));
		assert.strictEqual(level.mistakes, 1);
		level.reset();
		assert.strictEqual(level.mistakes, 0);
	});

	test('reset after completing plays again', async () => {
		const { level, successes } = create_level({ trial_count: 1 });
		level.start();
		level.win();
		assert.strictEqual(level.status, 'complete');
		level.reset();
		assert.strictEqual(level.status, 'presenting_prompt');
		await finish_prompt(level);
		guess_all(level);
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(successes.length, 2);
	});

	test('dispose stops the prompt and pending transitions', async () => {
		const { level, audio, successes } = create_level({ trial_count: 1 });
		level.start();
		level.dispose();
		await vi.advanceTimersByTimeAsync(DEFAULT_NOTE_DURATION * 4);
		assert.strictEqual(audio.played.length, 1);
		assert.strictEqual(level.status, 'presenting_prompt');

		const finished = create_level({ trial_count: 1 });
		finished.level.start();
		await finish_prompt(finished.level);
		guess_all(finished.level);
		finished.level.dispose();
		await vi.advanceTimersByTimeAsync(DEFAULT_FEEDBACK_DURATION);
		assert.strictEqual(finished.level.status, 'showing_success_feedback');
		assert.deepEqual(successes, []);
		assert.deepEqual(finished.successes, []);
	});

	test('win completes once', () => {
		const { level, successes } = create_level();
		level.start();
		level.win();
		level.win();
		assert.strictEqual(level.status, 'complete');
		assert.deepEqual(successes, [['level', 0]]);
	});

	test('the debug guesses steer the outcome', async () => {
		const { level } = create_level();
		level.start();
		await finish_prompt(level);
		level.guess_correctly();
		level.guess_incorrectly();
		assert.strictEqual(level.mistakes, 1);
		assert.strictEqual(level.status, 'showing_failure_feedback');
	});
});

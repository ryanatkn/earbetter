import {get, type Writable} from 'svelte/store';
import {randomItem, randomInt} from '@feltjs/util/random.js';
import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';
import {signal, batch, Signal} from '@preact/signals-core';

import {z_midi, type Midi} from '$lib/music/midi';
import {Intervals} from '$lib/music/notes';
import {play_note} from '$lib/audio/play_note';
import type {Volume} from '$lib/audio/helpers';

// TODO this isn't idiomatic signals code yet, uses `peek` too much

const log = new Logger('[level]');

export const DEFAULT_NOTE_DURATION = 500;
export const DEFAULT_NOTE_DURATION_FAILED = 50;
export const DEFAULT_FEEDBACK_DURATION = 1000;
export const DEFAULT_SEQUENCE_LENGTH = 4;
export const DEFAULT_TRIAL_COUNT = 5;

export type LevelId = Flavored<string, 'Level'>;
export const LevelId = z
	.string()
	.uuid()
	.transform((t) => t as LevelId);

// TODO add restrictions to the below def
export const LevelDef = z.object({
	id: LevelId,
	name: z.string(),
	intervals: Intervals,
	trial_count: z.number(),
	sequence_length: z.number(),
	note_min: z_midi,
	note_max: z_midi,
});
export type LevelDef = z.infer<typeof LevelDef>;

export type Status =
	| 'initial'
	| 'presenting_prompt'
	| 'waiting_for_input'
	| 'showing_success_feedback'
	| 'showing_failure_feedback'
	| 'complete';

// TODO BLOCK ambiguity with `Level.svelte` -- consider combining the two
// (hm not sure about that, but the ergnomics of components may be worth it)
export interface Level {
	def: Signal<LevelDef>;
	status: Signal<Status>;
	trial: Signal<Trial | null>;
	trials: Signal<Trial[]>;
	reset: () => void;
	// game methods
	start: () => void;
	guess: (note: Midi) => void;
	retry_trial: () => void;
	next_trial: () => void;
	complete_level: () => void;
	// dev and debug methods
	guess_correctly: () => void;
	get_correct_guess: () => number | null;
}

// TODO BLOCK decompose into signals?
export interface Trial {
	index: number;
	valid_notes: Set<Midi>;
	sequence: Midi[];
	presenting_index: number | null; // index of interval being presented
	guessing_index: number | null; // index of interval being guessed
	retry_count: number;
}

export const create_id = (): LevelId => crypto.randomUUID();

const create_next_trial = (def: LevelDef, current_trial: Trial | null): Trial => {
	const {note_min, note_max} = def;

	const interval_max = def.intervals.reduce((max, v) => Math.max(max, v));
	const interval_min = def.intervals.reduce((max, v) => Math.min(max, v));
	const tonic_max = Math.min(note_max - interval_max, note_max);
	const tonic_min = Math.max(note_min - interval_min, note_min);
	const tonic = (
		tonic_min < tonic_max ? randomInt(tonic_min, tonic_max) : to_fallback_tonic(note_min, note_max)
	) as Midi;
	const sequence: Midi[] = [tonic];

	// compute the valid notes
	const intervals = new Set([0, ...def.intervals]); // allow tonic to repeat
	const valid_notes: Midi[] = [];
	for (let i = note_min; i <= note_max; i++) {
		const interval = i - tonic;
		if (intervals.has(interval)) {
			valid_notes.push(i);
		}
	}

	// create the random sequence of notes
	for (let i = 0; i < def.sequence_length - 1; i++) {
		let next_note: Midi;
		do {
			next_note = randomItem(valid_notes);
		} while (next_note === sequence.at(-1)); // disallow sequential repeats
		sequence.push(next_note);
	}

	return {
		index: (current_trial && current_trial.index + 1) || 0,
		valid_notes: new Set(valid_notes),
		sequence,
		presenting_index: null,
		guessing_index: null,
		retry_count: 0,
	};
};

const DEFAULT_STATUS: Status = 'initial';
const DEFAULT_TRIAL: Trial | null = null;
const DEFAULT_TRIALS: Trial[] = [];

export const create_level = (
	level_def: LevelDef, // TODO maybe make optional?
	audio_ctx: AudioContext,
	volume: Writable<Volume>,
): Level => {
	const def: Signal<LevelDef> = signal(level_def);
	const status: Signal<Status> = signal(DEFAULT_STATUS);
	const trial: Signal<Trial | null> = signal(DEFAULT_TRIAL);
	const trials: Signal<Trial[]> = signal(DEFAULT_TRIALS);

	const start = (): void => {
		if (status.peek() !== 'initial') return;
		batch(() => {
			const next_trial = create_next_trial(def.peek(), trial.peek());
			log.trace('start level', trial);
			// TODO this is really "on enter presenting_prompt state" logic
			// TODO `s` is stale! so we need the timeout
			setTimeout(() => present_trial_prompt(next_trial.sequence));
			status.value = 'presenting_prompt';
			trial.value = next_trial;
			trials.value = [...trials.peek(), next_trial];
		});
	};

	const present_trial_prompt = async (sequence: Midi[]): Promise<void> => {
		log.trace('present_trial_prompt', sequence);
		const $trial = trial.peek();
		if (!$trial) return;
		// audio_ctx
		for (let i = 0; i < sequence.length; i++) {
			const note = sequence[i];
			trial.value = {
				...trial.peek()!,
				presenting_index: i,
			};
			await play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION); // eslint-disable-line no-await-in-loop
		}
		batch(() => {
			status.value = 'waiting_for_input';
			trial.value = {
				...trial.peek()!,
				presenting_index: null,
				guessing_index: 0,
			};
		});
	};

	// TODO helpful to have a return value?
	const guess = (note: Midi): void => {
		if (status.peek() !== 'waiting_for_input') return;
		const $trial = trial.peek();
		const guessing_index = $trial?.guessing_index;
		if (!$trial || guessing_index == null) return;
		batch(() => {
			const actual = get_correct_guess($trial);
			log.trace('guess', guessing_index, note, actual);

			// if incorrect -> FAILURE -> showing_failure_feedback -> REPROMPT
			if (actual !== note) {
				log.trace('guess incorrect');
				void play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION_FAILED);
				if (guessing_index === 0) {
					return; // no penalty or delay if this is the first one
				}
				// TODO this is really "on enter showing_failure_feedback state" logic
				setTimeout(() => retry_trial(), DEFAULT_FEEDBACK_DURATION);
				status.value = 'showing_failure_feedback';
			}

			// guess is correct
			void play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION);

			if (guessing_index >= $trial.sequence.length - 1) {
				// if more -> update current response index
				if ($trial.index < def.peek().trial_count - 1) {
					log.trace('guess correct and done with trial');
					// TODO this is really "on enter showing_success_feedback state" logic
					setTimeout(() => next_trial(), DEFAULT_FEEDBACK_DURATION);
					status.value = 'showing_success_feedback';
				} else {
					// TODO this is really "on enter showing_success_feedback state" logic
					log.trace('guess correct and done with all trials!');
					setTimeout(() => complete_level(), DEFAULT_FEEDBACK_DURATION);
					status.value = 'showing_success_feedback';
				}
			} else {
				// SUCCESS -> showing_success_feedback
				log.trace('guess correct BUT NOT DONE');
				trial.value = {
					...$trial,
					guessing_index: guessing_index + 1,
				};
			}
		});
	};

	const retry_trial = (): void => {
		const $status = status.peek();
		if (
			$status !== 'waiting_for_input' &&
			$status !== 'showing_success_feedback' &&
			$status !== 'showing_failure_feedback'
		) {
			return;
		}
		const $trial = trial.peek();
		if (!$trial) return;
		batch(() => {
			// TODO this is really "on enter presenting_prompt state" logic
			// TODO try to remove the timeout
			setTimeout(() => present_trial_prompt($trial.sequence));
			status.value = 'presenting_prompt';
			trial.value = {
				...$trial,
				retry_count: $trial.retry_count + 1,
			};
		});
	};

	const next_trial = (): void => {
		batch(() => {
			// TODO check this?
			// if (status !== 'showing_success_feedback') throw Error();
			const next_trial = create_next_trial(def.peek(), trial.peek());
			log.trace('next trial', next_trial);
			// TODO this is really "on enter presenting_prompt state" logic
			// TODO `s` is stale! so we need the timeout
			setTimeout(() => present_trial_prompt(next_trial.sequence));
			status.value = 'presenting_prompt';
			trial.value = next_trial;
			trials.value = [...trials.peek(), next_trial];
		});
	};

	const complete_level = (): void => {
		// TODO check this?
		// if (status !== 'showing_success_feedback') throw Error();
		batch(() => {
			status.value = 'complete';
			trial.value = null;
		});
	};

	const level: Level = {
		def,
		status,
		trial,
		trials,
		reset: () => {
			batch(() => {
				def.value = level_def;
				status.value = DEFAULT_STATUS;
				trial.value = DEFAULT_TRIAL;
				trials.value = DEFAULT_TRIALS;
				start();
			});
		},
		start,
		guess,
		retry_trial,
		next_trial,
		complete_level,
		// dev and debug methods
		guess_correctly: () => {
			if (status.peek() !== 'waiting_for_input') return;
			const midi = get_correct_guess(trial.peek());
			if (midi === null) return;
			guess(midi);
		},
		get_correct_guess: () => get_correct_guess(trial.peek()),
	};
	return level;
};

const get_correct_guess = (trial: Trial | null): Midi | null => {
	if (!trial || trial.guessing_index === null) return null;
	return trial.sequence[trial.guessing_index];
};

// If there's possible tonic range that fits with all of the intervals within the bounds,
// fall back to a reasonable default.
const to_fallback_tonic = (note_min: Midi, note_max: Midi): Midi => {
	const offset = ((note_max - note_min) / 4) | 0;
	return randomInt(note_min + offset, note_max - offset) as Midi;
};

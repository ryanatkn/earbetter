import {randomItem, randomInt} from '@feltjs/util/random.js';
import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';
import {Logger} from '@feltjs/util/log.js';
import {signal, batch, Signal, effect} from '@preact/signals-core';
import {base} from '$app/paths';

import {z_midi, type Midi} from '$lib/music/midi';
import {Intervals} from '$lib/music/notes';
import {play_note} from '$lib/audio/play_note';
import type {Instrument, Volume} from '$lib/audio/helpers';

// TODO this isn't idiomatic signals code yet, uses `peek` too much

const log = new Logger('[level]');

export const DEFAULT_NOTE_DURATION = 333; // TODO adjust this to make more challenging games
export const DEFAULT_NOTE_DURATION_2 = 500; // TODO adjust this to make more challenging games
export const DEFAULT_NOTE_DURATION_FAILED = 50;
export const DEFAULT_FEEDBACK_DURATION = 1000; // TODO configurable
export const DEFAULT_SEQUENCE_LENGTH = 4;
export const DEFAULT_TRIAL_COUNT = 5;

export type LevelId = Flavored<string, 'Level'>;
export const LevelId = z.string().uuid().transform<LevelId>(identity);
export const create_level_id = (): LevelId => crypto.randomUUID();

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

// TODO ambiguity with `Level.svelte` -- consider combining the two? or renaming the component, maybe it's the `LevelScene`
// (hm not sure about that, but the ergnomics of components may be worth it)
export interface Level {
	def: Signal<LevelDef>;
	status: Signal<Status>;
	mistakes: Signal<number>;
	trial: Signal<Trial | null>;
	trials: Signal<Trial[]>;
	reset: () => void;
	// game methods
	start: () => void;
	dispose: () => void;
	guess: (note: Midi) => void;
	retry_trial: () => void;
	next_trial: () => void;
	complete_level: () => void;
	// dev and debug methods
	win: () => void;
	guess_correctly: () => void;
	get_correct_guess: () => number | null;
}

// TODO extract into its own module? decompose into signals?
export interface Trial {
	index: number;
	valid_notes: Set<Midi>;
	sequence: Midi[];
	presenting_index: number | null; // index of interval being presented
	guessing_index: number | null; // index of interval being guessed
	retry_count: number;
}

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

	// TODO how to handle this? keep going? (if so need to avoid infinite loop below)
	if (valid_notes.length < 2) throw Error('invalid notes');

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
	ac: AudioContext,
	volume: Signal<Volume>,
	instrument: Signal<Instrument>,
): Level => {
	const def: Signal<LevelDef> = signal(level_def);
	const status: Signal<Status> = signal(DEFAULT_STATUS);
	const mistakes: Signal<number> = signal(0);
	const trial: Signal<Trial | null> = signal(DEFAULT_TRIAL);
	const trials: Signal<Trial[]> = signal(DEFAULT_TRIALS);

	const start = (): void => {
		if (status.peek() !== 'initial') return;
		next_trial();
	};

	effect(() => {
		if (status.value === 'presenting_prompt') {
			void present_trial_prompt();
		}
	});
	let seq_id = 0; // used to track the async note playing sequence for cancellation
	const present_trial_prompt = async (): Promise<void> => {
		const $trial = trial.peek();
		if (!$trial) return;
		log.trace('present_trial_prompt', $trial.sequence);
		trial.value = {...$trial, guessing_index: 0};
		const current_seq_id = ++seq_id;
		const sequence_length = $trial.sequence.length;
		for (let i = 0; i < sequence_length; i++) {
			const note = $trial.sequence[i];
			trial.value = {
				...trial.peek()!,
				presenting_index: i,
			};
			const duration =
				sequence_length < DEFAULT_SEQUENCE_LENGTH ? DEFAULT_NOTE_DURATION_2 : DEFAULT_NOTE_DURATION; // TODO refactor, see elsewhere
			await play_note(ac, note, volume.peek(), duration, instrument.peek()); // eslint-disable-line no-await-in-loop
			if (current_seq_id !== seq_id || !trial.peek()) return; // cancel
		}
		batch(() => {
			status.value = 'waiting_for_input';
			trial.value = {
				...trial.peek()!,
				presenting_index: null,
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
				void play_note(ac, note, volume.peek(), DEFAULT_NOTE_DURATION_FAILED, instrument.peek());
				if (guessing_index === 0 || !$trial.valid_notes.has(note)) {
					return; // no penalty or delay if this is the first one
				}
				// TODO should this be "on enter showing_failure_feedback state" logic?
				status.value = 'showing_failure_feedback';
				mistakes.value = mistakes.peek() + 1;
				setTimeout(() => retry_trial(), DEFAULT_FEEDBACK_DURATION); // TODO effects?
				return;
			}

			// guess is correct
			const sequence_length = $trial.sequence.length;
			const duration =
				sequence_length < DEFAULT_SEQUENCE_LENGTH ? DEFAULT_NOTE_DURATION_2 : DEFAULT_NOTE_DURATION; // TODO refactor, see elsewhere
			void play_note(ac, note, volume.peek(), duration, instrument.peek());

			if (guessing_index >= sequence_length - 1) {
				// if more -> update current response index
				status.value = 'showing_success_feedback';
				// TODO should this be "on enter showing_success_feedback state" logic?
				if ($trial.index < def.peek().trial_count - 1) {
					log.trace('guess correct and done with trial');
					setTimeout(() => next_trial(), DEFAULT_FEEDBACK_DURATION); // TODO effects?
				} else {
					log.trace('guess correct and done with all trials!');
					setTimeout(() => complete_level(), DEFAULT_FEEDBACK_DURATION); // TODO effects?
				}
			} else {
				// SUCCESS -> no status change because we show no visible positive feedback to users until the end
				log.trace('guess correct but not done');
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
			// TODO should this be "on enter presenting_prompt state" logic?
			status.value = 'presenting_prompt';
			trial.value = {
				...$trial,
				retry_count: $trial.retry_count + 1,
			};
		});
	};

	const next_trial = (): void => {
		batch(() => {
			const next_trial = create_next_trial(def.peek(), trial.peek());
			log.trace('next trial', next_trial);
			// TODO should this be "on enter presenting_prompt state" logic?
			status.value = 'presenting_prompt';
			const $trials = trials.peek();
			if ($trials.length === 0) mistakes.value = 0;
			trial.value = next_trial;
			trials.value = [...$trials, next_trial];
		});
	};

	const complete_level = (): void => {
		batch(() => {
			status.value = 'complete';
			trial.value = null;
		});
	};

	const level: Level = {
		def,
		status,
		mistakes,
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
		dispose: () => {
			seq_id++; // cancels anything that's playing
		},
		guess,
		retry_trial,
		next_trial,
		complete_level,
		// dev and debug methods
		win: () => {
			complete_level();
		},
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

export const to_play_level_url = (level_def: LevelDef): string =>
	`${base}/game/play#` + encodeURIComponent(JSON.stringify(level_def));

export const MistakesLevelStats = z.record(LevelId, z.array(z.number()));
export type MistakesLevelStats = z.infer<typeof MistakesLevelStats>;

export const LevelStats = z.object({
	mistakes: MistakesLevelStats,
});
export type LevelStats = z.infer<typeof LevelStats>;

export const DEFAULT_LEVEL_STATS: LevelStats = {mistakes: {}};

// TODO refactor - parameter? needs care tho, see comment below
export const MISTAKE_HISTORY_LENGTH = 5;

export const add_mistakes_to_level_stats = (
	level_stats: LevelStats,
	id: LevelId,
	mistakes: number,
): LevelStats => {
	const s = {...level_stats};
	s.mistakes = {...s.mistakes}; // preserves key order
	s.mistakes[id] = add_mistakes(s.mistakes[id], mistakes);
	return s;
};

const add_mistakes = (data: number[] | undefined, mistakes: number): number[] => {
	const updated = data?.slice() || [];
	if (updated.length >= MISTAKE_HISTORY_LENGTH) {
		updated.sort((a, b) => a - b).length = MISTAKE_HISTORY_LENGTH;
		if (mistakes < updated.at(-1)!) {
			updated[updated.length - 1] = mistakes;
		}
	} else {
		updated.push(mistakes);
	}
	return updated;
};

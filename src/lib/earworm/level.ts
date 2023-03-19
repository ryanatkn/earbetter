import {get, writable, type Writable} from 'svelte/store';
import {randomItem, randomInt} from '@feltjs/util/random.js';
import {z} from 'zod';

import type {Midi} from '$lib/music/midi';
import type {Semitones} from '$lib/music/notes';
import {play_note} from '$lib/audio/play_note';
import type {Flavored} from '@feltjs/util';
import type {Volume} from '$lib/audio/helpers';

export const DEFAULT_NOTE_DURATION = 500;
export const DEFAULT_NOTE_DURATION_FAILED = 50;
export const DEFAULT_FEEDBACK_DURATION = 1000;
export const DEFAULT_SEQUENCE_LENGTH = 4;
export const DEFAULT_TRIAL_COUNT = 5;

// TODO refactor/move
const z_midi = z
	.number()
	.gte(0)
	.lte(127)
	.transform((t) => t as Midi);

const z_level_id = z
	.string()
	.uuid()
	.transform((t) => t as LevelId);

const z_semitones = z.number().transform((s) => s as Semitones);

// TODO add restrictions to the below def
export const LevelDef = z.object({
	id: z_level_id,
	name: z.string(),
	intervals: z.array(z_semitones),
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

export type LevelStoreState = {
	status: Status;
	def: LevelDef;
	trial: Trial | null; // TODO these nullable values are unfortunate - maybe make this a type union based on status
	trials: Trial[];
};

export interface LevelStore {
	subscribe: Writable<LevelStoreState>['subscribe'];
	reset: () => void;
	// game methods
	start: () => void;
	guess: (note: Midi) => void;
	retry_trial: () => void;
	next_trial: () => void;
	complete_level: () => void;
	// dev and debug methods
	guess_correctly: ($level: LevelStoreState) => void;
	get_correct_guess: ($level: LevelStoreState) => number | null;
}

export interface Trial {
	index: number;
	valid_notes: Set<Midi>;
	sequence: Midi[];
	presenting_index: number | null; // index of interval being presented
	guessing_index: number | null; // index of interval being guessed
	retry_count: number;
}

export type LevelId = Flavored<string, 'Level'>;

export const create_id = (): LevelId => crypto.randomUUID();

const create_next_trial = ({def, trial}: LevelStoreState): Trial => {
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
		index: (trial && trial.index + 1) || 0,
		valid_notes: new Set(valid_notes),
		sequence,
		presenting_index: null,
		guessing_index: null,
		retry_count: 0,
	};
};

const to_default_state = (level_def: LevelDef): LevelStoreState => ({
	status: 'initial',
	def: level_def,
	trial: null,
	trials: [],
});

export const create_level_store = (
	level_def: LevelDef,
	audio_ctx: AudioContext,
	volume: Writable<Volume>,
): LevelStore => {
	const {subscribe, update, set} = writable<LevelStoreState>(to_default_state(level_def));

	const start = (): void => {
		update(($level) => {
			if ($level.status !== 'initial') throw Error();
			const trial = create_next_trial($level);
			console.log('TRIAL', trial);
			// TODO this is really "on enter presenting_prompt state" logic
			// TODO `s` is stale! so we need the timeout
			setTimeout(() => present_trial_prompt(trial.sequence));
			return {
				...$level,
				status: 'presenting_prompt',
				trial,
				trials: [...$level.trials, trial],
			};
		});
	};

	const present_trial_prompt = async (sequence: Midi[]): Promise<void> => {
		console.log('present_trial_prompt', sequence);
		// audio_ctx
		for (let i = 0; i < sequence.length; i++) {
			const note = sequence[i];
			update(($level) => ({
				...$level,
				trial: $level.trial && {
					...$level.trial,
					presenting_index: i,
				},
			}));
			await play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION); // eslint-disable-line no-await-in-loop
		}
		update(($level) => ({
			...$level,
			status: 'waiting_for_input',
			trial: $level.trial && {
				...$level.trial,
				presenting_index: null,
				guessing_index: 0,
			},
		}));
	};

	// TODO helpful to have a return value?
	const guess = (note: Midi): void => {
		update(($level) => {
			if ($level.status !== 'waiting_for_input') return $level;
			if (!$level.trial || $level.trial.guessing_index === null) {
				throw Error(`Expected a trial and guessing_index`);
			}
			console.log('guessing interval', $level.trial.guessing_index);
			const actual = get_correct_guess($level);
			console.log('guess', note, actual);

			// if incorrect -> FAILURE -> showing_failure_feedback -> REPROMPT
			if (actual !== note) {
				console.log('guess INCORRECT');
				void play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION_FAILED);
				if ($level.trial.guessing_index === 0) {
					return $level; // no penalty or delay if this is the first one
				}
				// TODO this is really "on enter showing_failure_feedback state" logic
				setTimeout(() => retry_trial(), DEFAULT_FEEDBACK_DURATION);
				return {
					...$level,
					status: 'showing_failure_feedback',
				};
			}

			// guess is correct
			void play_note(audio_ctx, note, get(volume), DEFAULT_NOTE_DURATION);

			if ($level.trial.guessing_index >= $level.trial.sequence.length - 1) {
				// if more -> update current response index
				if ($level.trial.index < $level.def.trial_count - 1) {
					console.log('guess CORRECT AND DONE WITH TRIAL!!');
					// TODO this is really "on enter showing_success_feedback state" logic
					setTimeout(() => next_trial(), DEFAULT_FEEDBACK_DURATION);
					return {
						...$level,
						status: 'showing_success_feedback',
					};
				} else {
					// TODO this is really "on enter showing_success_feedback state" logic
					console.log('guess CORRECT AND DONE WITH ALL TRIALS!!!!');
					setTimeout(() => complete_level(), DEFAULT_FEEDBACK_DURATION);
					return {
						...$level,
						status: 'showing_success_feedback',
					};
				}
			} else {
				// SUCCESS -> showing_success_feedback
				console.log('guess CORRECT BUT NOT DONE');
				return {
					...$level,
					trial: {
						...$level.trial,
						guessing_index: $level.trial.guessing_index + 1,
					},
				};
			}
		});
	};

	const retry_trial = (): void => {
		update(($level) => {
			const {status, trial} = $level;
			if (
				status !== 'waiting_for_input' &&
				status !== 'showing_success_feedback' &&
				status !== 'showing_failure_feedback'
			) {
				return $level;
			}

			// TODO this is really "on enter presenting_prompt state" logic
			// TODO try to remove the timeout
			setTimeout(() => trial && present_trial_prompt(trial.sequence));
			return {
				...$level,
				status: 'presenting_prompt',
				trial: trial && {
					...trial,
					retry_count: trial.retry_count + 1,
				},
			};
		});
	};

	const next_trial = (): void => {
		update(($level) => {
			// TODO check this?
			// if ($level.status !== 'showing_success_feedback') throw Error();
			const trial = create_next_trial($level);
			console.log('next trial', trial);
			// TODO this is really "on enter presenting_prompt state" logic
			// TODO `s` is stale! so we need the timeout
			setTimeout(() => present_trial_prompt(trial.sequence));
			return {
				...$level,
				status: 'presenting_prompt',
				trial,
				trials: [...$level.trials, trial],
			};
		});
	};

	const complete_level = (): void => {
		// TODO check this?
		// if ($level.status !== 'showing_success_feedback') throw Error();
		update(($level) => ({
			...$level,
			status: 'complete',
			trial: null,
		}));
	};

	const store: LevelStore = {
		subscribe,
		reset: () => {
			// TODO this causes errors if we have pending async events coming in! they should be canceled!
			set(to_default_state(level_def));
			start();
		},
		start,
		guess,
		retry_trial,
		next_trial,
		complete_level,
		// dev and debug methods
		guess_correctly: ($level: LevelStoreState): void => {
			if ($level.status !== 'waiting_for_input') return;
			const midi = get_correct_guess($level);
			if (midi === null) return;
			guess(midi);
		},
		get_correct_guess,
	};
	return store;
};

const get_correct_guess = ($level: LevelStoreState): Midi | null => {
	if (!$level.trial || $level.trial.guessing_index === null) return null;
	return $level.trial.sequence[$level.trial.guessing_index];
};

// If there's possible tonic range that fits with all of the intervals within the bounds,
// fall back to a reasonable default.
const to_fallback_tonic = (note_min: Midi, note_max: Midi): Midi => {
	const offset = ((note_max - note_min) / 4) | 0;
	return randomInt(note_min + offset, note_max - offset) as Midi;
};

// TODO BLOCK replace with zod
export const serialize_intervals = (intervals: number[]): string => intervals.join(', ');
export const parse_intervals = (value: string): number[] =>
	value
		.split(',')
		.map((v) => Number(v.trim()) | 0)
		.filter(Boolean); // exclude 0 intentionally

import {random_item, random_int} from '@ryanatkn/belt/random.js';
import {z} from 'zod';
import type {Flavored} from '@ryanatkn/belt/types.js';
import {resolve} from '$app/paths';

import {Midi, Intervals, midi_names} from '$lib/music.js';
import {play_note} from '$lib/play_note.js';
import type {Milliseconds} from '$lib/audio_helpers.js';
import {serialize_to_hash} from '$lib/url.js';
import {to_random_id} from '$lib/id.js';
import type {Get_Audio_Context} from '$lib/audio_context.js';
import type {App} from '$lib/earbetter/app.svelte.js';

// TODO this isn't idiomatic signals code yet, uses `peek` too much

export const DEFAULT_NOTE_DURATION: Milliseconds = 333; // TODO adjust this to make more challenging levels
export const DEFAULT_NOTE_DURATION_2: Milliseconds = 500; // TODO adjust this to make more challenging levels
export const DEFAULT_NOTE_DURATION_FAILED: Milliseconds = 67;
export const DEFAULT_FEEDBACK_DURATION: Milliseconds = 1000; // TODO configurable
export const DEFAULT_SEQUENCE_LENGTH = 2;
export const DEFAULT_TRIAL_COUNT = 5;
export const DEFAULT_LEVEL_NAME = 'new level';
export const DEFAULT_INTERVALS: Intervals = [5, 7];
export const DEFAULT_TONICS: Array<Midi> | null = null;
export const DEFAULT_MIN_NOTE: Midi = 48;
export const DEFAULT_MAX_NOTE: Midi = 84;

export const Level_Id = z.string();
export type Level_Id = Flavored<z.infer<typeof Level_Id>, 'Level_Id'>; // TODO @many this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
export const create_level_id = (): Level_Id => to_random_id();

export const Level_Name = z.string().min(1).max(1000);
export type Level_Name = Flavored<z.infer<typeof Level_Name>, 'Level_Name'>; // TODO @many this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?

export const Level_Data = z.object({
	id: Level_Id.default(create_level_id),
	name: Level_Name.default(DEFAULT_LEVEL_NAME),
	intervals: Intervals.default(() => DEFAULT_INTERVALS.slice()),
	tonics: z.array(Midi).nullable().default(DEFAULT_TONICS),
	trial_count: z.number().default(DEFAULT_TRIAL_COUNT),
	sequence_length: z.number().default(DEFAULT_SEQUENCE_LENGTH),
	min_note: Midi.default(DEFAULT_MIN_NOTE),
	max_note: Midi.default(DEFAULT_MAX_NOTE),
});
export type Level_Data = z.infer<typeof Level_Data>;

export const Level_Hash_Data = z.object({
	level: Level_Data,
});
export type Level_Hash_Data = z.infer<typeof Level_Hash_Data>;

export type Status =
	| 'initial'
	| 'presenting_prompt'
	| 'waiting_for_input'
	| 'showing_success_feedback'
	| 'showing_failure_feedback'
	| 'complete';

/**
 * The subset of `App` that a `Level` plays notes with.
 */
export type Level_Audio_State = Pick<App, 'playing_notes' | 'volume' | 'instrument'>;

// TODO extract into its own module? decompose into signals?
export interface Trial {
	index: number;
	valid_notes: Set<Midi>;
	sequence: Array<Midi>;
	presenting_index: number | null; // index of interval being presented
	guessing_index: number | null; // index of interval being guessed
	retry_count: number;
}

const DEFAULT_STATUS: Status = 'initial';
const DEFAULT_TRIAL: Trial | null = null;

export class Level {
	seq_id = 0; // used to track the async note playing sequence for cancellation
	feedback_timeout: ReturnType<typeof setTimeout> | undefined; // the pending transition after showing feedback

	readonly app: Level_Audio_State;
	readonly level_data: Level_Data; // TODO maybe make optional?
	readonly ac: Get_Audio_Context;
	register_success: (id: Level_Id, mistake_count: number) => void;
	readonly random: () => number;
	/**
	 * Why the level can't be played, if it can't. A level with an error never starts.
	 */
	readonly error: string | null;

	constructor(
		app: Level_Audio_State,
		level_data: Level_Data, // TODO maybe make optional?
		ac: Get_Audio_Context,
		register_success: (id: Level_Id, mistake_count: number) => void,
		random: () => number = Math.random,
	) {
		this.app = app;
		this.level_data = level_data;
		this.ac = ac;
		this.register_success = register_success;
		this.random = random;
		this.error = to_level_data_error(level_data);
	}

	status: Status = $state(DEFAULT_STATUS);
	mistakes: number = $state(0);
	trial: Trial | null = $state(DEFAULT_TRIAL);
	trials: Array<Trial> = $state([]);
	last_guess: Midi | null = $state(null);

	reset = (): void => {
		this.cancel();
		this.trial = DEFAULT_TRIAL;
		this.trials = [];
		this.update_status(DEFAULT_STATUS);
		this.start();
	};

	start = (): void => {
		if (this.error || this.status !== 'initial') return;
		this.next_trial();
	};

	dispose = (): void => {
		this.cancel();
	};

	/**
	 * Cancels the playing prompt and any pending feedback transition,
	 * so a stale transition can't act on a reset or disposed level.
	 */
	cancel(): void {
		this.seq_id++; // cancels anything that's playing
		clearTimeout(this.feedback_timeout);
		this.feedback_timeout = undefined;
	}

	/**
	 * Schedules the transition out of a feedback status, replacing any pending one.
	 */
	schedule_feedback(cb: () => void): void {
		clearTimeout(this.feedback_timeout);
		this.feedback_timeout = setTimeout(() => {
			this.feedback_timeout = undefined;
			cb();
		}, DEFAULT_FEEDBACK_DURATION);
	}

	update_status(value: Status): void {
		this.status = value;
		// TODO maybe a wait a tick here or refactor? is dependent on being called after changes to e.g. `this.trial`
		if (value === 'presenting_prompt') {
			void this.present_trial_prompt();
		} else if (value === 'complete') {
			this.register_success(this.level_data.id, this.mistakes);
		}
	}

	present_trial_prompt = async (): Promise<void> => {
		const trial = this.trial;
		if (!trial) return;
		this.trial = {...trial, guessing_index: 0};
		const current_seq_id = ++this.seq_id;
		const sequence_length = trial.sequence.length;
		for (let i = 0; i < sequence_length; i++) {
			const note = trial.sequence[i];
			this.trial = {
				...this.trial,
				presenting_index: i,
			};
			// eslint-disable-next-line no-await-in-loop
			await play_note(
				this.app,
				this.ac(),
				note,
				this.app.volume,
				to_note_duration(sequence_length),
				this.app.instrument,
			);
			if (current_seq_id !== this.seq_id) return; // cancel
		}
		this.trial = {
			...this.trial,
			presenting_index: null,
		};
		this.update_status('waiting_for_input');
	};

	// TODO helpful to have a return value?
	guess = (note: Midi): void => {
		if (this.status !== 'waiting_for_input') return;
		const trial = this.trial;
		const guessing_index = trial?.guessing_index;
		if (!trial || guessing_index == null) return;
		const actual = get_correct_guess_for_trial(trial);
		this.last_guess = note;

		// if incorrect -> FAILURE -> showing_failure_feedback -> REPROMPT
		if (actual !== note) {
			void play_note(
				this.app,
				this.ac(),
				note,
				this.app.volume,
				DEFAULT_NOTE_DURATION_FAILED,
				this.app.instrument,
			);
			if (guessing_index === 0 || !trial.valid_notes.has(note)) {
				return; // no penalty or delay if this is the first one
			}
			// TODO should this be "on enter showing_failure_feedback state" logic?
			this.mistakes += 1;
			this.update_status('showing_failure_feedback');
			this.schedule_feedback(this.retry_trial);
			return;
		}

		// guess is correct
		const sequence_length = trial.sequence.length;
		void play_note(
			this.app,
			this.ac(),
			note,
			this.app.volume,
			to_note_duration(sequence_length),
			this.app.instrument,
		);

		if (guessing_index >= sequence_length - 1) {
			// if more -> update current response index
			this.update_status('showing_success_feedback');
			// TODO should this be "on enter showing_success_feedback state" logic?
			if (trial.index < this.level_data.trial_count - 1) {
				this.schedule_feedback(this.next_trial);
			} else {
				this.schedule_feedback(this.complete_level); // TODO hacky, the single status mixes completion status and success feedback, seems like this should set complete immediately
			}
		} else {
			// SUCCESS -> no status change because we show no visible positive feedback to users until the end
			this.trial = {
				...trial,
				guessing_index: guessing_index + 1,
			};
		}
	};

	retry_trial = (): void => {
		const status = this.status;
		if (
			status !== 'waiting_for_input' &&
			status !== 'showing_success_feedback' &&
			status !== 'showing_failure_feedback'
		) {
			return;
		}
		const trial = this.trial;
		if (!trial) return;
		// a manual retry replaces the one scheduled by the failure, which would otherwise replay again
		if (status === 'showing_failure_feedback') clearTimeout(this.feedback_timeout);
		// TODO should this be "on enter presenting_prompt state" logic?
		this.trial = {
			...trial,
			retry_count: trial.retry_count + 1,
		};
		this.update_status('presenting_prompt');
	};

	next_trial = (): void => {
		if (this.status === 'complete') {
			return;
		}
		const next_trial = create_next_trial(this.level_data, this.trial, this.random);
		const trials = this.trials;
		if (trials.length === 0) this.mistakes = 0;
		this.trial = next_trial;
		this.trials = [...trials, next_trial];
		this.update_status('presenting_prompt');
	};

	complete_level = (): void => {
		if (this.status === 'complete') {
			return;
		}
		this.trial = null;
		this.update_status('complete');
	};

	// dev and debug methods
	win = (): void => {
		this.complete_level();
	};

	guess_correctly = (): void => {
		if (this.status !== 'waiting_for_input') return;
		const note = get_correct_guess_for_trial(this.trial);
		if (note === null) return;
		this.guess(note);
	};

	guess_incorrectly = (): void => {
		if (this.status !== 'waiting_for_input') return;
		const note = get_incorrect_guess_for_trial(this.trial, this.random);
		if (note === null) return;
		this.guess(note);
	};
}

/**
 * Shorter sequences play each note longer.
 */
export const to_note_duration = (sequence_length: number): Milliseconds =>
	sequence_length < DEFAULT_SEQUENCE_LENGTH ? DEFAULT_NOTE_DURATION_2 : DEFAULT_NOTE_DURATION;

export const get_correct_guess_for_trial = (trial: Trial | null): Midi | null => {
	if (trial?.guessing_index == null) return null;
	return trial.sequence[trial.guessing_index];
};

export const get_incorrect_guess_for_trial = (
	trial: Trial | null,
	random: () => number = Math.random,
): Midi | null => {
	if (!trial) return null;
	const correct_guess = get_correct_guess_for_trial(trial);
	if (correct_guess === null) return null;
	const incorrect_notes = Array.from(trial.valid_notes).filter((n) => n !== correct_guess);
	if (!incorrect_notes.length) return null;
	return random_item(incorrect_notes, random);
};

export const create_next_trial = (
	def: Level_Data,
	current_trial: Trial | null,
	random: () => number = Math.random,
): Trial => {
	const tonic = to_random_tonic(def, random);
	const sequence: Array<Midi> = [tonic];

	const valid_notes = create_valid_notes(tonic, def.min_note, def.max_note, def.intervals);

	// create the random sequence of notes
	for (let i = 0; i < def.sequence_length - 1; i++) {
		let next_note: Midi;
		do {
			next_note = random_item(valid_notes, random);
		} while (next_note === sequence.at(-1)); // disallow sequential repeats
		sequence.push(next_note);
	}

	return {
		index: (current_trial && current_trial.index + 1) ?? 0,
		valid_notes: new Set(valid_notes),
		sequence,
		presenting_index: null,
		guessing_index: null,
		retry_count: 0,
	};
};

/**
 * Computes the set of notes that can be selected in a trial
 * for a given tonic, note range, and intervals.
 * A trial's sequence of notes can be constructed from these.
 */
export const create_valid_notes = (
	tonic: Midi,
	min_note: Midi,
	max_note: Midi,
	intervals: Intervals,
): Array<Midi> => {
	const valid_intervals = new Set([0, ...intervals]); // allow tonic to repeat
	const valid_notes: Array<Midi> = [];
	for (let i = min_note; i <= max_note; i++) {
		const interval = i - tonic;
		if (valid_intervals.has(interval)) {
			valid_notes.push(i);
		}
	}

	// TODO how to handle this? upstream validation that `intervals.length >= 1`?
	if (valid_notes.length < 2) throw Error('invalid notes');
	return valid_notes;
};

/**
 * Picks a trial's tonic, preferring one that leaves room for every interval.
 * @throws Error if no tonic is usable, which `to_level_data_error` reports ahead of time
 */
export const to_random_tonic = (def: Level_Data, random: () => number = Math.random): Midi => {
	const {tonics, min_note, max_note, intervals} = def;
	if (tonics?.length) return random_item(tonics, random);
	if (!intervals.length) throw Error('a level needs at least one interval');
	const tonic_max = Math.min(max_note - Math.max(...intervals), max_note);
	const tonic_min = Math.max(min_note - Math.min(...intervals), min_note);
	return tonic_min <= tonic_max
		? random_int(tonic_min, tonic_max, random)
		: to_fallback_tonic(def, random);
};

/**
 * Picks a usable tonic when none fits every interval,
 * preferring the middle half of the range so both directions have room.
 * @throws Error if no tonic is usable
 */
export const to_fallback_tonic = (def: Level_Data, random: () => number = Math.random): Midi => {
	const usable = to_usable_tonics(def);
	if (!usable.length) throw Error('no tonic has an interval within the note range');
	const {min_note, max_note} = def;
	const offset = ((max_note - min_note) / 4) | 0;
	const middle = usable.filter((t) => t >= min_note + offset && t <= max_note - offset);
	return random_item(middle.length ? middle : usable, random);
};

/**
 * Whether a trial starting on `tonic` has a note to guess besides the tonic.
 */
export const is_usable_tonic = (
	tonic: Midi,
	min_note: Midi,
	max_note: Midi,
	intervals: Intervals,
): boolean =>
	tonic >= min_note &&
	tonic <= max_note &&
	intervals.some((i) => i !== 0 && tonic + i >= min_note && tonic + i <= max_note);

/**
 * Returns the tonics a level can start a trial on: its `tonics` if set, otherwise its whole range,
 * keeping only those with an interval inside the range.
 */
export const to_usable_tonics = (level_data: Level_Data): Array<Midi> => {
	const {tonics, min_note, max_note, intervals} = level_data;
	const candidates: ReadonlyArray<Midi> = tonics?.length
		? tonics
		: Array.from({length: Math.max(0, max_note - min_note + 1)}, (_, i) => min_note + i);
	return candidates.filter((t) => is_usable_tonic(t, min_note, max_note, intervals));
};

/**
 * Returns why a level can't be played, or `null` if it can.
 * This isn't a schema refinement because a failed parse discards the whole stored project.
 */
export const to_level_data_error = (level_data: Level_Data): string | null => {
	const {min_note, max_note, intervals, tonics, trial_count, sequence_length} = level_data;
	if (min_note >= max_note) return 'the lowest note must be lower than the highest';
	if (!intervals.some((i) => i !== 0)) return 'add at least one interval';
	if (!Number.isInteger(trial_count) || trial_count < 1) {
		return 'the trial count must be a whole number of at least 1';
	}
	if (!Number.isInteger(sequence_length) || sequence_length < 2) {
		return 'the sequence length must be a whole number of at least 2';
	}
	if (tonics?.length) {
		const unusable = tonics.filter((t) => !is_usable_tonic(t, min_note, max_note, intervals));
		if (unusable.length) {
			const names = unusable.map((t) => midi_names[t] ?? t).join(', ');
			return unusable.length === 1
				? `the tonic ${names} has no intervals within the note range`
				: `the tonics ${names} have no intervals within the note range`;
		}
	} else if (!to_usable_tonics(level_data).length) {
		return 'none of the intervals fit within the note range';
	}
	return null;
};

export const to_level_url = (level_data: Level_Data): string => {
	const data: Level_Hash_Data = {level: level_data};
	return resolve((`/trainer/level` + serialize_to_hash(data)) as any);
};

export const Mistakes_Level_Stats = z.record(Level_Id, z.array(z.number()).or(z.undefined()));
export type Mistakes_Level_Stats = z.infer<typeof Mistakes_Level_Stats>;

export const Level_Stats = z.object({
	mistakes: Mistakes_Level_Stats,
});
export type Level_Stats = z.infer<typeof Level_Stats>;

export const DEFAULT_LEVEL_STATS: Level_Stats = {mistakes: {}};

export const add_mistakes_to_level_stats = (
	level_stats: Level_Stats,
	id: Level_Id,
	mistakes: number,
): Level_Stats => {
	const s = {...level_stats};
	s.mistakes = {...s.mistakes}; // preserves key order
	s.mistakes[id] = add_mistakes(s.mistakes[id], mistakes);
	return s;
};

// TODO refactor - parameter?
export const MISTAKE_HISTORY_LENGTH = 4;

export const add_mistakes = (data: Array<number> | undefined, mistakes: number): Array<number> => {
	const updated = data?.slice() ?? [];
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

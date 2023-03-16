import {writable, type Writable} from 'svelte/store';
import {randomItem, randomInt} from '@feltjs/util/random.js';
import {UnreachableError} from '@feltjs/util/error.js';

import type {Midi} from '$lib/music/midi';
import {compute_interval, type Semitones} from '$lib/music/notes';
import {play_note} from '$lib/audio/play_note';

// TODO play a victory sound on complete
// TODO show feedback on the pressed buttons, regardless of how their interval was input (keyboard, tapping, clicking, debug key, etc)

const NOTE_DURATION = 500;
const NOTE_DURATION_FAILED = 50;

export interface LevelDef {
	id: string;
	trial_count: number;
	// The midi_min and midi_max define the entire allowable spectrum of notes.
	// Values like the intervals and octaveShift
	// may spill over combined with the tonic.
	midi_min: Midi;
	midi_max: Midi;
	octave_shift_min: 0 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9; // TODO shrink to more realistic values?
	octave_shift_max: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // TODO shrink to more realistic values?
	sequence_length: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16; // prettier-ignore
	intervals: Semitones[];
	x: number;
	y: number;
	// TODO probably want to specify a tuple of `[string, LevelRating]`
	// so things can unlock with 1-star performances
	// (or even 0-star performances, especially at the very beginning)
	// TODO support something like this,
	// and lay out levels in a pattern that combines levels that you beat into new levels
	// like 1/5/7 + 1/2/4  -> unlocks 1/2/4/5/7
	// unlock: [1, 2],
	unlock?: string[];
}

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
	send: (event: EventName | EventData) => void;
	reset: () => void;
	is_input_disabled: ($level: LevelStoreState, index: number) => boolean;
	// game methods
	guess: (note: Midi) => void;
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

const create_next_trial = ({def, trial}: LevelStoreState): Trial => {
	const {midi_min, midi_max, octave_shift_min, octave_shift_max} = def;

	const tonic_max = midi_max - 12;
	if (tonic_max < midi_min) {
		throw Error(`tonic_max(${tonic_max}) is bigger than midi_min(${midi_min})`);
	}
	const tonic = randomInt(midi_min, tonic_max) as Midi;
	const sequence: Midi[] = [tonic];

	// compute the valid notes
	const intervals = new Set([0, ...def.intervals]); // allow tonic to repeat
	const valid_notes: Midi[] = [];
	const note_min = Math.max(midi_min, tonic + octave_shift_min * 12) as Midi;
	const note_max = Math.min(midi_max, tonic + octave_shift_max * 12 + 12) as Midi; // always span the tonic's octave
	for (let i = note_min; i <= note_max; i++) {
		const interval = compute_interval(tonic, i);

		// is the interval valid? add this note if so
		if (intervals.has(interval)) {
			valid_notes.push(i);
		}
	}

	if (valid_notes.length <= 2) {
		// TODO use TS invariant helper!
		console.log({
			def,
			trial,
			tonic,
			sequence,
			intervals,
			valid_notes,
			note_min,
			note_max,
		});
		throw Error(
			`valid_notes aren't valid! [${valid_notes.join(
				', ',
			)}]. Is the code buggy or is the def data bad?`,
		);
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

export type EventName = 'START' | 'PRESENTED' | 'NEXT_TRIAL' | 'RETRY_TRIAL' | 'COMPLETE_LEVEL';
export type EventData =
	| {type: 'START'}
	| {type: 'NEXT_TRIAL'}
	| {type: 'RETRY_TRIAL'}
	| {type: 'COMPLETE_LEVEL'}
	| {type: 'PRESENTED'};

const default_state = (level_def: LevelDef): LevelStoreState => ({
	status: 'initial',
	def: level_def,
	trial: null,
	trials: [],
});

export const create_level_store = (level_def: LevelDef, audio_ctx: AudioContext): LevelStore => {
	const {subscribe, update, set} = writable<LevelStoreState>(default_state(level_def));

	const present_trial_prompt = async (sequence: Midi[]): Promise<void> => {
		console.log('PRESENT TRIAL PROMPT', sequence);
		// audio_ctx
		for (let i = 0; i < sequence.length; i++) {
			const note = sequence[i];
			console.log('SET INTERVAL', note);
			update(($level) => ({
				...$level,
				trial: $level.trial && {
					...$level.trial,
					presenting_index: i,
				},
			}));
			await play_note(audio_ctx, note, NOTE_DURATION); // eslint-disable-line no-await-in-loop
		}
		update(($level) => ({
			...$level,
			trial: $level.trial && {
				...$level.trial,
				presenting_index: null,
			},
		}));
		// TODO when presenting is complete, we want to automatically transition to the `waiting_for_input` state
		send('PRESENTED');
	};

	// TODO helpful to have a return value?
	const guess = (note: Midi): void => {
		update(($level) => {
			if ($level.status !== 'waiting_for_input') throw Error();
			if (!$level.trial || $level.trial.guessing_index === null) {
				throw Error(`Expected a trial and guessing_index`);
			}
			console.log('guessing interval', $level.trial.guessing_index);
			const actual = get_correct_guess($level);
			console.log('guess', note, actual);

			// if incorrect -> FAILURE -> showing_failure_feedback -> REPROMPT
			if (actual !== note) {
				console.log('guess INCORRECT');
				void play_note(audio_ctx, note, NOTE_DURATION_FAILED);
				if ($level.trial.guessing_index === 0) {
					return $level; // no penalty or delay if this is the first one
				}
				// TODO this is really "on enter showing_failure_feedback state" logic
				setTimeout(() => send('RETRY_TRIAL'), 1000);
				return {
					...$level,
					status: 'showing_failure_feedback',
				};
			}

			// guess is correct
			void play_note(audio_ctx, note, NOTE_DURATION);

			if ($level.trial.guessing_index >= $level.trial.sequence.length - 1) {
				// if more -> update current response index
				if ($level.trial.index < $level.def.trial_count - 1) {
					console.log('guess CORRECT AND DONE WITH TRIAL!!');
					// TODO this is really "on enter showing_success_feedback state" logic
					setTimeout(() => send('NEXT_TRIAL'), 1000);
					return {
						...$level,
						status: 'showing_success_feedback',
					};
				} else {
					// TODO this is really "on enter showing_success_feedback state" logic
					console.log('guess CORRECT AND DONE WITH ALL TRIALS!!!!');
					setTimeout(() => send('COMPLETE_LEVEL'), 1000);
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

	const send = (event: EventName | EventData): void => {
		const e = typeof event === 'string' ? {type: event} : event;
		console.log(`send ${e.type}`, e);
		update(($level) => {
			// This is a reducer but state-machiney,
			// first switching on the current status of the store (aka machine).
			switch ($level.status) {
				case 'initial': {
					switch (e.type) {
						case 'START': {
							const trial = create_next_trial($level);
							console.log('TRIAL', trial);
							// TODO this is really "on enter presenting_prompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => present_trial_prompt(trial.sequence), 0);
							return {
								...$level,
								status: 'presenting_prompt',
								trial,
								trials: [...$level.trials, trial],
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'presenting_prompt': {
					switch (e.type) {
						case 'PRESENTED': {
							return {
								...$level,
								status: 'waiting_for_input',
								trial: $level.trial && {
									...$level.trial,
									guessing_index: 0,
								},
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'showing_success_feedback': {
					switch (e.type) {
						case 'NEXT_TRIAL': {
							const trial = create_next_trial($level);
							console.log('TRIAL', trial);
							// TODO this is really "on enter presenting_prompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => present_trial_prompt(trial.sequence), 0);
							return {
								...$level,
								status: 'presenting_prompt',
								trial,
								trials: [...$level.trials, trial],
							};
						}
						case 'COMPLETE_LEVEL': {
							return {
								...$level,
								status: 'complete',
								trial: null,
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'showing_failure_feedback': {
					switch (e.type) {
						case 'RETRY_TRIAL': {
							// TODO this is really "on enter presenting_prompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => present_trial_prompt($level.trial!.sequence), 0);
							return {
								...$level,
								status: 'presenting_prompt',
								trial: $level.trial && {
									...$level.trial,
									retry_count: $level.trial.retry_count + 1,
								},
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
			}
			throw Error();
		});
	};

	const store: LevelStore = {
		subscribe,
		send,
		reset: () => {
			// TODO should this be defined as an event?
			// TODO this causes errors if we have pending async events coming in! they should be canceled!
			set(default_state(level_def));
		},
		is_input_disabled,
		guess,
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

const is_input_disabled = ($level: LevelStoreState, index: number): boolean => {
	if ($level.status !== 'waiting_for_input') return true;
	if (index === 0) return false;
	return !$level.def.intervals.includes(index);
};

const get_correct_guess = ($level: LevelStoreState): Midi | null => {
	if (!$level.trial || $level.trial.guessing_index === null) return null;
	return $level.trial.sequence[$level.trial.guessing_index];
};

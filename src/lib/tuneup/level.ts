import {writable, type Writable} from 'svelte/store';
import {randomItem, randomInt} from '@feltcoop/util/random.js';
import {UnreachableError} from '@feltcoop/util/error.js';

import {SMOOTH_GAIN_TIME_CONSTANT} from '$lib/audio/utils';
import {type Midi, midiToFreq} from '$lib/music/midi';
import {DEFAULT_TUNING} from '$lib/music/constants';
import {computeInterval, type Semitones} from '$lib/music/notes';

// TODO play a victory sound on complete
// TODO show feedback on the pressed buttons, regardless of how their interval was input (keyboard, tapping, clicking, debug key, etc)

// TODO convert to xstate

// TODO rename status to state?

const NOTE_DURATION = 500;

export interface LevelDef {
	id: string;
	trialCount: number;
	// The midiMin and midiMax define the entire allowable spectrum of notes.
	// Values like the intervals and octaveShift
	// may spill over combined with the tonic.
	midiMin: Midi;
	midiMax: Midi;
	octaveShiftMin: 0 | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9; // TODO shrink to more realistic values?
	octaveShiftMax: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // TODO shrink to more realistic values?
	sequenceLength: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16; // prettier-ignore
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
	| 'presentingPrompt'
	| 'waitingForInput'
	| 'showingSuccessFeedback'
	| 'showingFailureFeedback'
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
	isInputDisabled: ($level: LevelStoreState, index: number) => boolean;
	// dev and debug methods
	guessCorrectly: ($level: LevelStoreState) => void;
	getCorrectGuess: ($level: LevelStoreState) => number | null;
}

export interface Trial {
	index: number;
	validNotes: Set<Midi>;
	sequence: Midi[];
	presentingIndex: number | null; // index of interval being presented
	guessingIndex: number | null; // index of interval being guessed
	retryCount: number;
}

const createNextTrial = ({def, trial}: LevelStoreState): Trial => {
	const {midiMin, midiMax, octaveShiftMin, octaveShiftMax} = def;

	const tonicMax = midiMax - 12;
	if (tonicMax < midiMin) {
		throw Error(`tonicMax(${tonicMax}) is bigger than midiMin(${midiMin})`);
	}
	const tonic = randomInt(midiMin, tonicMax) as Midi;
	const sequence: Midi[] = [tonic];

	// compute the valid notes
	const intervals = new Set([0, ...def.intervals]); // allow tonic to repeat
	const validNotes: Midi[] = [];
	const noteMin = Math.max(midiMin, tonic + octaveShiftMin * 12) as Midi;
	const noteMax = Math.min(midiMax, tonic + octaveShiftMax * 12 + 12) as Midi; // always span the tonic's octave
	for (let i = noteMin; i <= noteMax; i++) {
		const interval = computeInterval(tonic, i);

		// is the interval valid? add this note if so
		if (intervals.has(interval)) {
			validNotes.push(i);
		}
	}

	if (validNotes.length <= 2) {
		// TODO use TS invariant helper!
		console.log({
			def,
			trial,
			tonic,
			sequence,
			intervals,
			validNotes,
			noteMin,
			noteMax,
		});
		throw Error(
			`validNotes aren't valid! [${validNotes.join(
				', ',
			)}]. Is the code buggy or is the def data bad?`,
		);
	}

	// create the random sequence of notes
	for (let i = 0; i < def.sequenceLength - 1; i++) {
		let nextNote: Midi;
		do {
			nextNote = randomItem(validNotes);
		} while (nextNote === sequence.at(-1)); // disallow sequential repeats
		sequence.push(nextNote);
	}

	return {
		index: (trial && trial.index + 1) || 0,
		validNotes: new Set(validNotes),
		sequence,
		presentingIndex: null,
		guessingIndex: null,
		retryCount: 0,
	};
};

export type EventName = 'START' | 'PRESENTED' | 'NEXT_TRIAL' | 'RETRY_TRIAL' | 'COMPLETE_LEVEL';
export type EventData =
	| {type: 'START'}
	| {type: 'NEXT_TRIAL'}
	| {type: 'RETRY_TRIAL'}
	| {type: 'COMPLETE_LEVEL'}
	| {type: 'PRESENTED'}
	| {type: 'GUESS'; midi: Midi};

const playNote = async (audioCtx: AudioContext, note: Midi, durationMs: number) => {
	// TODO
	const freq = midiToFreq(note, DEFAULT_TUNING);
	console.log('playing note', note, freq);

	const gain = audioCtx.createGain();
	gain.gain.value = 0.1; // TODO volume variable
	gain.connect(audioCtx.destination);
	const osc = audioCtx.createOscillator();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
	osc.start();
	osc.connect(gain);

	const endTime = audioCtx.currentTime + durationMs / 1000;
	gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
	osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);

	await new Promise((r) => setTimeout(r, durationMs));
};

const defaultState = (levelDef: LevelDef): LevelStoreState => ({
	status: 'initial',
	def: levelDef,
	trial: null,
	trials: [],
});

export const createLevelStore = (levelDef: LevelDef, audioCtx: AudioContext): LevelStore => {
	const {subscribe, update, set} = writable<LevelStoreState>(defaultState(levelDef));

	const presentTrialPrompt = async (sequence: Midi[]): Promise<void> => {
		console.log('PRESENT TRIAL PROMPT', sequence);
		// audioCtx
		for (let i = 0; i < sequence.length; i++) {
			const note = sequence[i];
			console.log('SET INTERVAL', note);
			update(($level) => ({
				...$level,
				trial: $level.trial && {
					...$level.trial,
					presentingIndex: i,
				},
			}));
			await playNote(audioCtx, note, NOTE_DURATION); // eslint-disable-line no-await-in-loop
		}
		update(($level) => ({
			...$level,
			trial: $level.trial && {
				...$level.trial,
				presentingIndex: null,
			},
		}));
		// TODO when presenting is complete, we want to automatically transition to the `waitingForInput` state
		send('PRESENTED');
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
							const trial = createNextTrial($level);
							console.log('TRIAL', trial);
							// TODO this is really "on enter presentingPrompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => presentTrialPrompt(trial.sequence), 0); // TODO do side effects within the xstate api
							return {
								...$level,
								status: 'presentingPrompt',
								trial,
								trials: [...$level.trials, trial],
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'presentingPrompt': {
					switch (e.type) {
						case 'PRESENTED': {
							return {
								...$level,
								status: 'waitingForInput',
								trial: $level.trial && {
									...$level.trial,
									guessingIndex: 0,
								},
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'waitingForInput': {
					switch (e.type) {
						case 'GUESS': {
							if (!$level.trial || $level.trial.guessingIndex === null) {
								throw Error(`Expected a trial and guessingIndex`); // TODO how to encode in xstate?
							}
							console.log('guessing interval', $level.trial.guessingIndex);
							const guess = e.midi;
							const actual = getCorrectGuess($level);
							void playNote(audioCtx, guess, NOTE_DURATION);
							console.log('GUESS', e.midi, guess, actual);
							// if incorrect -> FAILURE -> showingFailureFeedback -> REPROMPT
							if (actual !== guess) {
								console.log('GUESS INCORRECT');
								// TODO this is really "on enter showingFailureFeedback state" logic
								setTimeout(() => send('RETRY_TRIAL'), 1000);
								return {
									...$level,
									status: 'showingFailureFeedback',
								};
							}
							// else if more -> update current response index
							else if ($level.trial.guessingIndex >= $level.trial.sequence.length - 1) {
								if ($level.trial.index < $level.def.trialCount - 1) {
									console.log('GUESS CORRECT AND DONE WITH TRIAL!!');
									// TODO this is really "on enter showingSuccessFeedback state" logic
									setTimeout(() => send('NEXT_TRIAL'), 1000);
									return {
										...$level,
										status: 'showingSuccessFeedback',
									};
								} else {
									// TODO this is really "on enter showingSuccessFeedback state" logic
									console.log('GUESS CORRECT AND DONE WITH ALL TRIALS!!!!');
									setTimeout(() => send('COMPLETE_LEVEL'), 1000);
									return {
										...$level,
										status: 'showingSuccessFeedback',
									};
								}
							}
							// else -> SUCCESS -> showingSuccessFeedback
							else {
								console.log('GUESS CORRECT BUT NOT DONE');
								return {
									...$level,
									trial: {
										...$level.trial,
										guessingIndex: $level.trial.guessingIndex + 1,
									},
								};
							}
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'showingSuccessFeedback': {
					switch (e.type) {
						case 'NEXT_TRIAL': {
							const trial = createNextTrial($level);
							console.log('TRIAL', trial);
							// TODO this is really "on enter presentingPrompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => presentTrialPrompt(trial.sequence), 0); // TODO do side effects within the xstate api
							return {
								...$level,
								status: 'presentingPrompt',
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
				case 'showingFailureFeedback': {
					switch (e.type) {
						case 'RETRY_TRIAL': {
							// TODO this is really "on enter presentingPrompt state" logic
							// TODO `s` is stale! so we need the timeout
							setTimeout(() => presentTrialPrompt($level.trial!.sequence), 0); // TODO do side effects within the xstate api
							return {
								...$level,
								status: 'presentingPrompt',
								trial: $level.trial && {
									...$level.trial,
									retryCount: $level.trial.retryCount + 1,
								},
							};
						}
						default: {
							throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
						}
					}
				}
				case 'complete': {
					// TODO this is a final state in xstate for the level machine
					throw Error(`Unhandled event ${e.type} during status ${$level.status}`);
				}
				default:
					throw new UnreachableError($level.status);
			}
		});
	};

	return {
		subscribe,
		send,
		reset: () => {
			// TODO should this be defined as an event?
			// TODO this causes errors if we have pending async events coming in! they should be canceled!
			set(defaultState(levelDef));
		},
		isInputDisabled,

		// dev and debug methods
		guessCorrectly: ($level: LevelStoreState): void => {
			if ($level.status !== 'waitingForInput') return;
			const midi = getCorrectGuess($level);
			if (midi === null) return;
			send({type: 'GUESS', midi});
		},
		getCorrectGuess,
	};
};

const isInputDisabled = ($level: LevelStoreState, index: number): boolean => {
	if ($level.status !== 'waitingForInput') return true;
	if (index === 0) return false;
	return !$level.def.intervals.includes(index);
};

const getCorrectGuess = ($level: LevelStoreState): Midi | null => {
	if (!$level.trial || $level.trial.guessingIndex === null) return null;
	return $level.trial.sequence[$level.trial.guessingIndex];
};

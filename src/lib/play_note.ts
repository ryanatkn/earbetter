import type {Signal} from '@preact/signals-core';

import {
	DEFAULT_VOLUME,
	SMOOTH_GAIN_TIME_CONSTANT,
	volume_to_gain,
	type Instrument,
	type Milliseconds,
	type Volume,
} from '$lib/audio_helpers.js';
import {type Midi, midi_to_freq} from '$lib/music.js';

// TODO this API is haphazard and somewhat bad, in particular `play_note` versus `start_playing` and `stop_playing`,
// and we need to support more options like `velocity`, should probably have a single options object.
// One possibility is `play_note` accepts both a `duration` and `unless_already` flag.
// Needs a full rethink with the `Audio` class idea.

export const play_note = (
	state: {playing_notes: Signal<Set<Midi>>},
	ac: AudioContext,
	note: Midi,
	volume: Volume,
	duration: Milliseconds,
	instrument?: Instrument,
): Promise<void> => {
	const stop = start_playing_note(state, ac, note, volume, instrument);
	return new Promise((resolve) =>
		setTimeout(() => {
			stop();
			resolve();
		}, duration),
	);
};

const stop_osc = (
	ac: AudioContext,
	duration: Milliseconds,
	gain: GainNode,
	osc: OscillatorNode,
) => {
	const endTime = ac.currentTime + duration / 1000;
	gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
	osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);
};

export type Stop_Playing = () => void;

export const start_playing_note = (
	state: {playing_notes: Signal<Set<Midi>>},
	ac: AudioContext,
	note: Midi,
	volume: Volume = DEFAULT_VOLUME,
	instrument: Instrument = 'sine',
): Stop_Playing => {
	const freq = midi_to_freq(note);
	console.log('start playing note', note, freq, volume, instrument);

	const gain = ac.createGain();
	gain.gain.value = volume_to_gain(volume);
	gain.connect(ac.destination);
	const osc = ac.createOscillator();
	osc.type = instrument;
	osc.frequency.setValueAtTime(freq, ac.currentTime);
	osc.start();
	osc.connect(gain);

	const next_playing_notes = new Set(state.playing_notes.peek());
	next_playing_notes.add(note);
	state.playing_notes.value = next_playing_notes;

	let disposed = false;
	return () => {
		if (disposed) return;
		disposed = true;

		console.log(`stop playing note`, note);
		stop_osc(ac, 10, gain, osc);

		const next_playing_notes = new Set(state.playing_notes.peek());
		next_playing_notes.delete(note);
		state.playing_notes.value = next_playing_notes;
	};
};

// Helpers to play a single note at a time.
// Maybe this should be put in the main context and wrap `ac` so it's not accessed directly?

// TODO is redundant with `playing_notes` and manually updated
const playing: Map<Midi, Stop_Playing> = new Map(); // global cache used to enforce that at most one of each note plays

export const start_playing = (
	state: {playing_notes: Signal<Set<Midi>>},
	ac: AudioContext,
	note: Midi,
	volume?: Volume,
	instrument?: Instrument,
): void => {
	const current = playing.get(note);
	if (current) return;
	playing.set(note, start_playing_note(state, ac, note, volume, instrument));
};

export const stop_playing = (note: Midi): void => {
	const stop = playing.get(note);
	if (!stop) return;
	stop();
	playing.delete(note);
};

import type { SvelteSet } from 'svelte/reactivity';

import {
	DEFAULT_VOLUME,
	SMOOTH_GAIN_TIME_CONSTANT,
	volume_to_gain,
	type Instrument,
	type Milliseconds,
	type Volume
} from './audio_helpers.ts';
import { type Midi, midi_to_freq } from './music.ts';

// Held notes, like a pressed piano key, go through `App.start_note` and `App.stop_note`,
// which build on `start_playing_note` here.

export const play_note = (
	state: { playing_notes: SvelteSet<Midi> },
	ac: AudioContext,
	note: Midi,
	volume: Volume,
	duration: Milliseconds,
	instrument?: Instrument
): Promise<void> => {
	const stop = start_playing_note(state, ac, note, volume, instrument);
	return new Promise((resolve) =>
		setTimeout(() => {
			stop();
			resolve();
		}, duration)
	);
};

const stop_osc = (
	ac: AudioContext,
	duration: Milliseconds,
	gain: GainNode,
	osc: OscillatorNode
) => {
	const endTime = ac.currentTime + duration / 1000;
	gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
	osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);
};

export type StopPlaying = () => void;

export const start_playing_note = (
	state: { playing_notes: SvelteSet<Midi> },
	ac: AudioContext,
	note: Midi,
	volume: Volume = DEFAULT_VOLUME,
	instrument: Instrument = 'sine'
): StopPlaying => {
	const freq = midi_to_freq(note);
	const gain = ac.createGain();
	gain.gain.value = volume_to_gain(volume);
	gain.connect(ac.destination);
	const osc = ac.createOscillator();
	osc.type = instrument;
	osc.frequency.setValueAtTime(freq, ac.currentTime);
	osc.start();
	osc.connect(gain);

	state.playing_notes.add(note);

	let disposed = false;
	return () => {
		if (disposed) return;
		disposed = true;
		stop_osc(ac, 10, gain, osc);

		state.playing_notes.delete(note);
	};
};

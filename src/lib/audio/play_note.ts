import {signal, type Signal} from '@preact/signals-core';

import {
	DEFAULT_VOLUME,
	SMOOTH_GAIN_TIME_CONSTANT,
	volume_to_gain,
	type Milliseconds,
	type Volume,
} from '$lib/audio/helpers';
import {type Midi, midi_to_freq} from '$lib/music/midi';

// TODO this API is haphazard, in particular `play_note` versus `start_playing` and `stop_playing`,
// and we need to support more options like `velocity`, should probably have a single options object

export const play_note = (
	audio_ctx: AudioContext,
	note: Midi,
	volume: Volume,
	duration: Milliseconds,
	type?: OscillatorType,
): Promise<void> => {
	const stop = start_playing_note(audio_ctx, note, volume, type);
	return new Promise((resolve) =>
		setTimeout(() => {
			stop();
			resolve();
		}, duration),
	);
};

const stop_osc = (
	audio_ctx: AudioContext,
	duration: Milliseconds,
	gain: GainNode,
	osc: OscillatorNode,
) => {
	const endTime = audio_ctx.currentTime + duration / 1000;
	gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
	osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);
};

export interface StopPlaying {
	(): void;
}

// TODO is redundant with `playing` and manually updated
export const playing_notes: Signal<Set<Midi>> = signal(new Set());

export const start_playing_note = (
	audio_ctx: AudioContext,
	note: Midi,
	volume: Volume = DEFAULT_VOLUME,
	type: OscillatorType = 'sine',
): StopPlaying => {
	const freq = midi_to_freq(note);
	console.log('start playing note', note, freq);

	const gain = audio_ctx.createGain();
	gain.gain.value = volume_to_gain(volume);
	gain.connect(audio_ctx.destination);
	const osc = audio_ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, audio_ctx.currentTime);
	osc.start();
	osc.connect(gain);

	const next_playing_notes = new Set(playing_notes.peek());
	next_playing_notes.add(note);
	playing_notes.value = next_playing_notes;

	let disposed = false;
	return () => {
		if (disposed) return;
		disposed = true;

		console.log(`stop playing note`, note);
		stop_osc(audio_ctx, 10, gain, osc);

		const next_playing_notes = new Set(playing_notes.peek());
		next_playing_notes.delete(note);
		playing_notes.value = next_playing_notes;
	};
};

// Helpers to play a single note at a time.
// Maybe this should be put in the main context and wrap `audio_ctx` so it's not accessed directly?

// TODO is redundant with `playing_notes` and manually updated
const playing: Map<Midi, StopPlaying> = new Map(); // global cache used to enforce that at most one of each note plays

export const start_playing = (
	audio_ctx: AudioContext,
	note: Midi,
	volume?: Volume,
	type?: OscillatorType,
): void => {
	const current = playing.get(note);
	if (current) return;
	playing.set(note, start_playing_note(audio_ctx, note, volume, type));
};

export const stop_playing = (note: Midi): void => {
	const stop_playing_note = playing.get(note);
	if (!stop_playing_note) return;
	stop_playing_note?.();
	playing.delete(note);
};

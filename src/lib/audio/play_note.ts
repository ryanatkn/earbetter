import {writable, type Writable} from 'svelte/store';

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
): Promise<void> => {
	const stop = start_playing_note(audio_ctx, note, volume);
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
export const playing_notes: Writable<Set<Midi>> = writable(new Set());

export const start_playing_note = (
	audio_ctx: AudioContext,
	note: Midi,
	volume: Volume = DEFAULT_VOLUME,
): StopPlaying => {
	const freq = midi_to_freq(note);
	console.log('start playing note', note, freq);

	const gain = audio_ctx.createGain();
	gain.gain.value = volume_to_gain(volume);
	gain.connect(audio_ctx.destination);
	const osc = audio_ctx.createOscillator();
	osc.type = 'sine'; // TODO "custom" | "sawtooth" | "sine" | "square" | "triangle"
	osc.frequency.setValueAtTime(freq, audio_ctx.currentTime);
	osc.start();
	osc.connect(gain);

	playing_notes.update((v) => {
		const v2 = new Set(v);
		v2.add(note);
		return v2;
	});
	return () => {
		console.log(`stop playing note`, note);
		stop_osc(audio_ctx, 10, gain, osc);
		playing_notes.update((v) => {
			const v2 = new Set(v);
			v2.delete(note);
			return v2;
		});
	};
};

// Helpers to play a single note at a time.
// Maybe this should be put in the main context and wrap `audio_ctx` so it's not accessed directly?

const playing: Map<Midi, StopPlaying> = new Map(); // global cache used to enforce that at most one of each note plays

export const start_playing = (audio_ctx: AudioContext, note: Midi, volume?: Volume): void => {
	const current = playing.get(note);
	if (current) return;
	playing.set(note, start_playing_note(audio_ctx, note, volume));
};

export const stop_playing = (note: Midi): void => {
	const stop_playing_note = playing.get(note);
	if (!stop_playing_note) return;
	stop_playing_note?.();
	playing.delete(note);
};

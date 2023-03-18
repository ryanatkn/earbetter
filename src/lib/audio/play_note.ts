import type {Flavored} from '@feltjs/util';

import {DEFAULT_VOLUME, SMOOTH_GAIN_TIME_CONSTANT, volume_to_gain} from '$lib/audio/helpers';
import {type Midi, midi_to_freq} from '$lib/music/midi';

export type Milliseconds = Flavored<number, 'Milliseconds'>;

export const play_note = (
	audio_ctx: AudioContext,
	note: Midi,
	duration: Milliseconds,
	volume: number,
): Promise<void> => {
	const freq = midi_to_freq(note);
	console.log('playing note', note, freq);

	const gain = audio_ctx.createGain();
	gain.gain.value = volume_to_gain(volume);
	gain.connect(audio_ctx.destination);
	const osc = audio_ctx.createOscillator();
	osc.type = 'sine'; // TODO "custom" | "sawtooth" | "sine" | "square" | "triangle"
	osc.frequency.setValueAtTime(freq, audio_ctx.currentTime);
	osc.start();
	osc.connect(gain);

	stop_osc(audio_ctx, duration, gain, osc);

	return new Promise((r) => setTimeout(r, duration));
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

export const start_playing_note = (
	audio_ctx: AudioContext,
	note: Midi,
	volume = DEFAULT_VOLUME,
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

	return () => {
		console.log(`stop playing note`, note);
		stop_osc(audio_ctx, 10, gain, osc);
	};
};

// Helpers to play a single note at a time.
// Maybe this should be put in the main context and wrap `audio_ctx` so it's not accessed directly?

// TODO allow playing notes at different volumes using velocity
const playing: Map<Midi, StopPlaying> = new Map(); // global cache used to enforce that at most one of each note plays

export const start_playing = (audio_ctx: AudioContext, note: Midi, volume?: number): void => {
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

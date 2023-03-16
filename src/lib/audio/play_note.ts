import {SMOOTH_GAIN_TIME_CONSTANT} from '$lib/audio/helpers';
import {type Midi, midi_to_freq} from '$lib/music/midi';

export const play_note = (
	audio_ctx: AudioContext,
	note: Midi,
	durationMs: number,
): Promise<void> => {
	// TODO
	const freq = midi_to_freq(note);
	console.log('playing note', note, freq);

	const gain = audio_ctx.createGain();
	gain.gain.value = 0.1; // TODO volume variable
	gain.connect(audio_ctx.destination);
	const osc = audio_ctx.createOscillator();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(freq, audio_ctx.currentTime);
	osc.start();
	osc.connect(gain);

	const endTime = audio_ctx.currentTime + durationMs / 1000;
	gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
	osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);

	return new Promise((r) => setTimeout(r, durationMs));
};

export interface StopPlaying {
	(): void;
}

export const start_playing_note = (audio_ctx: AudioContext, note: Midi): StopPlaying => {
	const freq = midi_to_freq(note);
	console.log('start playing note', note, freq);

	const gain = audio_ctx.createGain();
	gain.gain.value = 0.1; // TODO volume variable
	gain.connect(audio_ctx.destination);
	const osc = audio_ctx.createOscillator();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(freq, audio_ctx.currentTime);
	osc.start();
	osc.connect(gain);

	return () => {
		console.log(`stop playing note`, note);
		const endTime = audio_ctx.currentTime + 10 / 1000;
		gain.gain.setTargetAtTime(0, endTime, SMOOTH_GAIN_TIME_CONSTANT);
		osc.stop(endTime + SMOOTH_GAIN_TIME_CONSTANT * 2);
	};
};

// Helpers to play a single note at a time.
// Maybe this should be put in the main context and wrap `audio_ctx` so it's not accessed directly?

// TODO allow playing notes at different volumes using velocity
const playing: Map<Midi, StopPlaying> = new Map(); // global cache used to enforce that at most one of each note plays

export const start_playing = (audio_ctx: AudioContext, note: Midi): void => {
	const current = playing.get(note);
	if (current) return;
	playing.set(note, start_playing_note(audio_ctx, note));
};

export const stop_playing = (note: Midi): void => {
	const stop_playing_note = playing.get(note);
	if (!stop_playing_note) return;
	stop_playing_note?.();
	playing.delete(note);
};

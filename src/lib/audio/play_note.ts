import {SMOOTH_GAIN_TIME_CONSTANT} from '$lib/audio/utils';
import {type Midi, midiToFreq} from '$lib/music/midi';

export const play_note = (
	audio_ctx: AudioContext,
	note: Midi,
	durationMs: number,
): Promise<void> => {
	// TODO
	const freq = midiToFreq(note);
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
	const freq = midiToFreq(note);
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

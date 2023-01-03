import {SMOOTH_GAIN_TIME_CONSTANT} from '$lib/audio/utils';
import {type Midi, midiToFreq} from '$lib/music/midi';
import {DEFAULT_TUNING} from '$lib/music/constants';

export const playNote = async (
	audioCtx: AudioContext,
	note: Midi,
	durationMs: number,
): Promise<void> => {
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

	return new Promise((r) => setTimeout(r, durationMs));
};

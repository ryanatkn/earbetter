import * as s from '@fuzdev/fuz_schema/schema.ts';
import { noop } from '@fuzdev/fuz_util/function.ts';
import { round } from '@fuzdev/fuz_util/maths.ts';

import {
	DEFAULT_VOLUME,
	SMOOTH_GAIN_TIME_CONSTANT,
	volume_to_gain,
	type Frequency,
	type Volume
} from './audio_helpers.ts';
import { midi_to_freq } from './music.ts';
import type { StopPlaying } from './play_note.ts';

export const PULSE_RATE_MIN = 1;
export const PULSE_RATE_MAX = 100;

/**
 * Pulses per second, in Hz. Slow rates are heard as a rhythm
 * and fast ones fuse into a low buzzing pitch.
 */
export const PulseRate = s.flavor(
	s.pipe(
		s.number,
		s.min_value(PULSE_RATE_MIN),
		s.max_value(PULSE_RATE_MAX),
		s.transform((v: number) => round(v, 1))
	),
	'PulseRate'
);
export type PulseRate = s.Infer<typeof PulseRate>;

export const DEFAULT_PULSE_RATE: PulseRate = 40;

/**
 * - `click` is a train of short clicks
 * - `soft_click` is the same with rounded edges, so it's duller and less harsh
 * - `pip` is a train of very short bursts of a tone
 * - `tone` is a steady tone whose loudness swells and fades once per pulse
 * - `gated_tone` is a tone switched on and off once per pulse
 * - `noise` is a steady hiss whose loudness swells and fades once per pulse
 */
export const pulse_sounds = ['click', 'soft_click', 'pip', 'tone', 'gated_tone', 'noise'] as const;
export const PulseSound = s.one_of(pulse_sounds);
export type PulseSound = s.Infer<typeof PulseSound>;

export const DEFAULT_PULSE_SOUND: PulseSound = 'click';

/**
 * The sounds rendered as a train of identical short shapes, one per pulse.
 */
type PulseTrainSound = 'click' | 'soft_click' | 'pip';

/**
 * The sounds made by modulating the loudness of a continuous carrier.
 */
type PulseModulatedSound = Exclude<PulseSound, PulseTrainSound>;

/**
 * Whether `sound` is made from a tone, so `PulsePitch` affects it.
 */
export const pulse_sound_is_pitched = (sound: PulseSound): boolean =>
	sound === 'pip' || sound === 'tone' || sound === 'gated_tone';

export const PULSE_PITCH_MIN = 21;
export const PULSE_PITCH_MAX = 108;

/**
 * The pitch of the sounds made from a tone, as a MIDI note spanning the keys of a piano.
 * It's flavored as `Midi` so it works with the music helpers.
 */
export const PulsePitch = s.flavor(
	s.pipe(s.number, s.integer, s.min_value(PULSE_PITCH_MIN), s.max_value(PULSE_PITCH_MAX)),
	'Midi'
);
export type PulsePitch = s.Infer<typeof PulsePitch>;

export const DEFAULT_PULSE_PITCH: PulsePitch = 69;

/**
 * The length of each click in seconds.
 */
export const PULSE_CLICK_DURATION = 0.001;

/**
 * The length of each pip in seconds, long enough to hold a few cycles of a mid-range pitch.
 * Low pitches fit less than a cycle and fade toward a faint thump.
 * It's half the period of `PULSE_RATE_MAX`, so pips never overlap.
 */
export const PULSE_PIP_DURATION = 0.005;

/**
 * How long a `gated_tone` takes to switch on or off, in seconds.
 * An instant switch would add a click of its own at each edge.
 */
export const PULSE_GATE_RAMP_DURATION = 0.001;

/**
 * The length of the looped noise in seconds, long enough that the repetition isn't heard.
 */
export const PULSE_NOISE_DURATION = 2;

/**
 * How much of the looped noise blends its end into its start, in seconds.
 */
const NOISE_BLEND_DURATION = 0.05;

/**
 * Scales the tones down toward the loudness of the `click` sound,
 * which is silent for most of each period.
 */
export const PULSE_TONE_LEVEL = 0.5; // TODO tune by ear, this roughly matches the sounds' power at the default rate

/**
 * A bell-shaped window that eases from silence up to full and back over `length` samples.
 */
const to_hann = (i: number, length: number): number =>
	0.5 - 0.5 * Math.cos((2 * Math.PI * (i + 0.5)) / length);

const to_shape_length = (sample_rate: number, duration: number): number =>
	Math.max(1, Math.round(duration * sample_rate));

/**
 * Creates the shape of one `click`, a rectangular pulse.
 * @param sample_rate
 * @param duration - in seconds
 */
export const create_pulse_click_shape = (
	sample_rate: number,
	duration: number = PULSE_CLICK_DURATION
): Float32Array<ArrayBuffer> => new Float32Array(to_shape_length(sample_rate, duration)).fill(1);

/**
 * Creates the shape of one `soft_click`, a click with its edges rounded off.
 * @param sample_rate
 * @param duration - in seconds
 */
export const create_pulse_soft_click_shape = (
	sample_rate: number,
	duration: number = PULSE_CLICK_DURATION
): Float32Array<ArrayBuffer> => {
	const shape = new Float32Array(to_shape_length(sample_rate, duration));
	for (let i = 0; i < shape.length; i++) {
		shape[i] = to_hann(i, shape.length);
	}
	return shape;
};

/**
 * Creates the shape of one `pip`, a burst of a sine wave that eases in and out.
 * Every pip starts at the same point of the wave, so the pips of a train are identical.
 * @param sample_rate
 * @param frequency - the frequency of the sine wave in Hz
 * @param duration - in seconds
 */
export const create_pulse_pip_shape = (
	sample_rate: number,
	frequency: Frequency,
	duration: number = PULSE_PIP_DURATION
): Float32Array<ArrayBuffer> => {
	const shape = new Float32Array(to_shape_length(sample_rate, duration));
	for (let i = 0; i < shape.length; i++) {
		shape[i] = to_hann(i, shape.length) * Math.sin((2 * Math.PI * frequency * i) / sample_rate);
	}
	return shape;
};

/**
 * Creates the loudness of a `gated_tone` across the half of a period it's switched on,
 * ramping up from silence and back down at the edges.
 * @param sample_rate
 * @param rate
 * @param ramp_duration - in seconds
 */
export const create_pulse_gate_shape = (
	sample_rate: number,
	rate: PulseRate,
	ramp_duration: number = PULSE_GATE_RAMP_DURATION
): Float32Array<ArrayBuffer> => {
	const shape = new Float32Array(Math.max(1, Math.floor(sample_rate / rate / 2))).fill(1);
	const ramp_length = Math.min(Math.round(ramp_duration * sample_rate), shape.length >> 1);
	for (let i = 0; i < ramp_length; i++) {
		// the rising half of the window, mirrored for the falling edge
		const v = to_hann(i, ramp_length * 2);
		shape[i] = v;
		shape[shape.length - 1 - i] = v;
	}
	return shape;
};

/**
 * Renders a loop that repeats `shape` at `rate`.
 *
 * A period is rarely a whole number of samples, and looping one rounded period
 * would play a slightly wrong rate, so the loop spans about a second of whole periods
 * with each `shape` placed at its nearest sample.
 * @param sample_rate - the sample rate of the `AudioContext` that plays the loop
 * @param rate
 * @param shape - the samples of one pulse, which should be shorter than a period
 * @returns the samples of one channel, to be played looping
 */
export const create_pulse_train_samples = (
	sample_rate: number,
	rate: PulseRate,
	shape: Float32Array
): Float32Array<ArrayBuffer> => {
	const periods = Math.max(1, Math.round(rate));
	const samples = new Float32Array(Math.round((periods * sample_rate) / rate));
	for (let i = 0; i < periods; i++) {
		const start = Math.round((i * sample_rate) / rate);
		samples.set(shape.subarray(0, samples.length - start), start);
	}
	return samples;
};

/**
 * Renders a loop of pink noise, which sounds softer than white noise
 * because its energy falls off toward the high frequencies.
 * The end of the loop is blended into its start so the seam isn't heard.
 * @param sample_rate - the sample rate of the `AudioContext` that plays the loop
 * @param random
 * @param duration - in seconds
 * @returns the samples of one channel peaking at full scale, to be played looping
 */
export const create_pulse_noise_samples = (
	sample_rate: number,
	random: () => number = Math.random,
	duration: number = PULSE_NOISE_DURATION
): Float32Array<ArrayBuffer> => {
	const length = Math.max(1, Math.round(duration * sample_rate));
	const blend_length = Math.min(length, Math.round(NOISE_BLEND_DURATION * sample_rate));
	// Paul Kellet's economy filter turns white noise pink
	// https://www.firstpr.com.au/dsp/pink-noise/
	const raw = new Float32Array(length + blend_length);
	let b0 = 0;
	let b1 = 0;
	let b2 = 0;
	for (let i = 0; i < raw.length; i++) {
		const white = random() * 2 - 1;
		b0 = 0.99765 * b0 + white * 0.099046;
		b1 = 0.963 * b1 + white * 0.2965164;
		b2 = 0.57 * b2 + white * 1.0526913;
		raw[i] = b0 + b1 + b2 + white * 0.1848;
	}
	// the stretch that continues past the end fades out over the start as it fades in,
	// keeping the power even, so the last sample flows into the first
	const samples = raw.slice(0, length);
	for (let i = 0; i < blend_length; i++) {
		const t = (i + 0.5) / blend_length;
		samples[i] = raw[i]! * Math.sqrt(t) + raw[length + i]! * Math.sqrt(1 - t);
	}
	let peak = 0;
	for (const v of samples) peak = Math.max(peak, Math.abs(v));
	if (peak > 0) {
		for (let i = 0; i < length; i++) samples[i]! /= peak;
	}
	return samples;
};

/**
 * A playing pulse, adjustable until it's stopped.
 */
export interface PulseVoice {
	set_rate: (rate: PulseRate) => void;
	/**
	 * Ignored by the sounds that have no pitch, see `pulse_sound_is_pitched`.
	 */
	set_pitch: (pitch: PulsePitch) => void;
	set_volume: (volume: Volume) => void;
	/**
	 * Fades out and stops. A stopped voice ignores further calls.
	 */
	stop: StopPlaying;
}

export interface PulseVoiceOptions {
	sound: PulseSound;
	rate: PulseRate;
	/**
	 * Used by only the sounds that have a pitch, see `pulse_sound_is_pitched`.
	 */
	pitch?: PulsePitch;
	volume?: Volume;
	/**
	 * The source of the `noise` sound's randomness.
	 */
	random?: () => number;
}

/**
 * Starts a continuous pulse that plays until its `stop` is called.
 *
 * Everything is scheduled on the audio clock and no timers are involved,
 * so the rate holds steady in a background tab where timers get throttled.
 */
export const start_pulse = (ac: AudioContext, options: PulseVoiceOptions): PulseVoice => {
	const {
		sound,
		rate,
		pitch = DEFAULT_PULSE_PITCH,
		volume = DEFAULT_VOLUME,
		random = Math.random
	} = options;
	const output = ac.createGain();
	output.gain.setValueAtTime(0, ac.currentTime);
	output.gain.setTargetAtTime(volume_to_gain(volume), ac.currentTime, SMOOTH_GAIN_TIME_CONSTANT);
	output.connect(ac.destination);

	const source =
		sound === 'click' || sound === 'soft_click' || sound === 'pip'
			? start_train_source(ac, output, sound, rate, pitch)
			: start_modulated_source(ac, output, sound, rate, pitch, random);

	let stopped = false;
	return {
		set_rate: (rate) => {
			if (!stopped) source.set_rate(rate);
		},
		set_pitch: (pitch) => {
			if (!stopped) source.set_pitch(pitch);
		},
		set_volume: (volume) => {
			if (stopped) return;
			output.gain.setTargetAtTime(
				volume_to_gain(volume),
				ac.currentTime,
				SMOOTH_GAIN_TIME_CONSTANT
			);
		},
		stop: () => {
			if (stopped) return;
			stopped = true;
			const time = ac.currentTime;
			output.gain.setTargetAtTime(0, time, SMOOTH_GAIN_TIME_CONSTANT);
			// five time constants leave under 1% of the gain, so cutting the source is inaudible
			source.stop(time + SMOOTH_GAIN_TIME_CONSTANT * 5);
		}
	};
};

interface PulseSource {
	set_rate: (rate: PulseRate) => void;
	set_pitch: (pitch: PulsePitch) => void;
	/**
	 * @param time - when to stop on the audio clock, in seconds
	 */
	stop: (time: number) => void;
}

const start_loop = (
	ac: AudioContext,
	destination: AudioNode,
	samples: Float32Array<ArrayBuffer>,
	time: number
): AudioBufferSourceNode => {
	const buffer = ac.createBuffer(1, samples.length, ac.sampleRate);
	buffer.copyToChannel(samples, 0);
	const node = ac.createBufferSource();
	node.buffer = buffer;
	node.loop = true;
	node.connect(destination);
	node.start(time);
	return node;
};

interface SwappableLoop {
	/**
	 * Renders again and swaps in the new loop, for when what `render` reads has changed.
	 */
	swap: () => void;
	stop: (time: number) => void;
}

/**
 * Loops what `render` returns. The rate of a loop is baked into its samples,
 * so changing it means rendering a new loop and swapping it in.
 */
const start_swappable_loop = (
	ac: AudioContext,
	destination: AudioNode,
	render: () => Float32Array<ArrayBuffer>
): SwappableLoop => {
	let node = start_loop(ac, destination, render(), ac.currentTime);
	return {
		swap: () => {
			const time = ac.currentTime;
			node.stop(time);
			node = start_loop(ac, destination, render(), time);
		},
		stop: (time) => node.stop(time)
	};
};

const create_train_shape = (
	sound: PulseTrainSound,
	sample_rate: number,
	pitch: PulsePitch
): Float32Array<ArrayBuffer> => {
	switch (sound) {
		case 'click':
			return create_pulse_click_shape(sample_rate);
		case 'soft_click':
			return create_pulse_soft_click_shape(sample_rate);
		case 'pip':
			return create_pulse_pip_shape(sample_rate, midi_to_freq(pitch));
	}
};

const start_train_source = (
	ac: AudioContext,
	output: AudioNode,
	sound: PulseTrainSound,
	initial_rate: PulseRate,
	initial_pitch: PulsePitch
): PulseSource => {
	let rate = initial_rate;
	let pitch = initial_pitch;
	const loop = start_swappable_loop(ac, output, () =>
		create_pulse_train_samples(ac.sampleRate, rate, create_train_shape(sound, ac.sampleRate, pitch))
	);
	return {
		set_rate: (value) => {
			rate = value;
			loop.swap();
		},
		set_pitch: (value) => {
			pitch = value;
			if (pulse_sound_is_pitched(sound)) loop.swap();
		},
		stop: loop.stop
	};
};

const start_modulated_source = (
	ac: AudioContext,
	output: AudioNode,
	sound: PulseModulatedSound,
	rate: PulseRate,
	pitch: PulsePitch,
	random: () => number
): PulseSource => {
	// the carrier passes through `envelope`, whose gain the modulator moves between silence and `level`
	const envelope = ac.createGain();
	envelope.connect(output);
	const level = sound === 'noise' ? 1 : PULSE_TONE_LEVEL;
	const carrier =
		sound === 'noise'
			? start_noise_carrier(ac, envelope, random)
			: start_tone_carrier(ac, envelope, pitch);
	const modulator =
		sound === 'gated_tone'
			? start_gate_modulator(ac, envelope.gain, rate, level)
			: start_swell_modulator(ac, envelope.gain, rate, level);
	return {
		set_rate: modulator.set_rate,
		set_pitch: carrier.set_pitch,
		stop: (time) => {
			carrier.stop(time);
			modulator.stop(time);
		}
	};
};

const start_tone_carrier = (
	ac: AudioContext,
	destination: AudioNode,
	pitch: PulsePitch
): Pick<PulseSource, 'set_pitch' | 'stop'> => {
	const oscillator = ac.createOscillator();
	oscillator.frequency.setValueAtTime(midi_to_freq(pitch), ac.currentTime);
	oscillator.connect(destination);
	oscillator.start();
	return {
		set_pitch: (pitch) => {
			oscillator.frequency.setTargetAtTime(
				midi_to_freq(pitch),
				ac.currentTime,
				SMOOTH_GAIN_TIME_CONSTANT
			);
		},
		stop: (time) => oscillator.stop(time)
	};
};

const start_noise_carrier = (
	ac: AudioContext,
	destination: AudioNode,
	random: () => number
): Pick<PulseSource, 'set_pitch' | 'stop'> => {
	const node = start_loop(
		ac,
		destination,
		create_pulse_noise_samples(ac.sampleRate, random),
		ac.currentTime
	);
	return {
		set_pitch: noop, // noise has no pitch
		stop: (time) => node.stop(time)
	};
};

/**
 * Swells `gain` smoothly between silence and `level` once per pulse.
 */
const start_swell_modulator = (
	ac: AudioContext,
	gain: AudioParam,
	rate: PulseRate,
	level: number
): Pick<PulseSource, 'set_rate' | 'stop'> => {
	// the gain rests at half and the oscillator swings it by half each way through `depth`,
	// so it reaches silence without inverting
	gain.setValueAtTime(level / 2, ac.currentTime);
	const depth = ac.createGain();
	depth.gain.setValueAtTime(level / 2, ac.currentTime);
	const oscillator = ac.createOscillator();
	oscillator.frequency.setValueAtTime(rate, ac.currentTime);
	oscillator.connect(depth);
	depth.connect(gain);
	oscillator.start();
	return {
		set_rate: (rate) => {
			oscillator.frequency.setTargetAtTime(rate, ac.currentTime, SMOOTH_GAIN_TIME_CONSTANT);
		},
		stop: (time) => oscillator.stop(time)
	};
};

/**
 * Switches `gain` between silence and `level`, on for half of each pulse.
 */
const start_gate_modulator = (
	ac: AudioContext,
	gain: AudioParam,
	initial_rate: PulseRate,
	level: number
): Pick<PulseSource, 'set_rate' | 'stop'> => {
	let rate = initial_rate;
	// the gain rests at silence and the looping gate lifts it through `depth`
	gain.setValueAtTime(0, ac.currentTime);
	const depth = ac.createGain();
	depth.gain.setValueAtTime(level, ac.currentTime);
	depth.connect(gain);
	const loop = start_swappable_loop(ac, depth, () =>
		create_pulse_train_samples(ac.sampleRate, rate, create_pulse_gate_shape(ac.sampleRate, rate))
	);
	return {
		set_rate: (value) => {
			rate = value;
			loop.swap();
		},
		stop: loop.stop
	};
};

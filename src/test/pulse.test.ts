import * as s from '@fuzdev/fuz_schema/schema.ts';
import { create_random_alea } from '@fuzdev/fuz_util/random_alea.ts';
import { describe, test, assert } from 'vitest';

import { SMOOTH_GAIN_TIME_CONSTANT, volume_to_gain } from '#lib/audio_helpers.ts';
import {
	create_pulse_click_shape,
	create_pulse_gate_shape,
	create_pulse_noise_samples,
	create_pulse_pip_shape,
	create_pulse_soft_click_shape,
	create_pulse_train_samples,
	pulse_sound_is_pitched,
	pulse_sounds,
	PULSE_RATE_MAX,
	PULSE_RATE_MIN,
	PULSE_PITCH_MAX,
	PULSE_PITCH_MIN,
	PULSE_TONE_LEVEL,
	PulsePitch,
	PulseRate,
	PulseSound,
	start_pulse
} from '#lib/pulse.ts';
import { create_fake_pulse_audio } from './pulse_test_helpers.ts';

/**
 * Returns the index of each sample where a pulse begins after silence.
 */
const find_pulse_starts = (samples: Float32Array): Array<number> => {
	const starts: Array<number> = [];
	for (let i = 0; i < samples.length; i++) {
		if (samples[i] !== 0 && (i === 0 || samples[i - 1] === 0)) starts.push(i);
	}
	return starts;
};

const to_peak = (samples: Float32Array): number =>
	samples.reduce((peak, v) => Math.max(peak, Math.abs(v)), 0);

const assert_close = (actual: number, expected: number, tolerance = 1e-6): void => {
	assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be near ${expected}`);
};

describe('PulseRate', () => {
	test('rounds to one decimal', () => {
		assert.strictEqual(s.parse_or_throw(PulseRate, 40.04), 40);
		assert.strictEqual(s.parse_or_throw(PulseRate, 7.26), 7.3);
	});

	test('rejects out of range and non-numbers', () => {
		assert.ok(!s.parse(PulseRate, PULSE_RATE_MIN - 0.1).ok);
		assert.ok(!s.parse(PulseRate, PULSE_RATE_MAX + 0.1).ok);
		assert.ok(!s.parse(PulseRate, null).ok);
	});
});

describe('PulsePitch', () => {
	test('accepts the notes of a piano', () => {
		assert.strictEqual(s.parse_or_throw(PulsePitch, PULSE_PITCH_MIN), 21);
		assert.strictEqual(s.parse_or_throw(PulsePitch, PULSE_PITCH_MAX), 108);
	});

	test('rejects out of range and fractional notes', () => {
		assert.ok(!s.parse(PulsePitch, PULSE_PITCH_MIN - 1).ok);
		assert.ok(!s.parse(PulsePitch, PULSE_PITCH_MAX + 1).ok);
		assert.ok(!s.parse(PulsePitch, 60.5).ok);
	});
});

test('PulseSound accepts only the known sounds', () => {
	for (const sound of pulse_sounds) assert.ok(s.parse(PulseSound, sound).ok);
	assert.ok(!s.parse(PulseSound, 'buzz').ok);
});

test('pulse_sound_is_pitched is true for the sounds made from a tone', () => {
	assert.deepEqual(
		pulse_sounds.filter((sound) => pulse_sound_is_pitched(sound)),
		['pip', 'tone', 'gated_tone']
	);
});

describe('create_pulse_click_shape', () => {
	test('is a rectangular pulse of the duration', () => {
		assert.deepEqual(Array.from(create_pulse_click_shape(48000, 0.001)), new Array(48).fill(1));
	});

	test('is always at least one sample long', () => {
		assert.deepEqual(Array.from(create_pulse_click_shape(8000, 0.00001)), [1]);
	});
});

describe('create_pulse_soft_click_shape', () => {
	test('eases symmetrically from near silence up to near full', () => {
		const shape = create_pulse_soft_click_shape(48000, 0.001);
		assert.strictEqual(shape.length, 48);
		assert.ok(shape[0]! < 0.01);
		assert.ok(to_peak(shape) > 0.99 && to_peak(shape) <= 1);
		for (let i = 0; i < 24; i++) {
			assert_close(shape[i]!, shape[47 - i]!);
			if (i > 0) assert.ok(shape[i]! > shape[i - 1]!);
		}
	});

	test('carries less energy than the click it softens', () => {
		const energy = (shape: Float32Array): number => shape.reduce((sum, v) => sum + v * v, 0);
		assert.ok(
			energy(create_pulse_soft_click_shape(48000)) < energy(create_pulse_click_shape(48000))
		);
	});
});

describe('create_pulse_pip_shape', () => {
	test('is a burst of the frequency that eases in and out', () => {
		const shape = create_pulse_pip_shape(48000, 1000, 0.005);
		assert.strictEqual(shape.length, 240);
		assert.strictEqual(shape[0], 0);
		assert.ok(Math.abs(shape.at(-1)!) < 0.01);
		assert.ok(to_peak(shape) > 0.9 && to_peak(shape) <= 1);
		// five cycles fit, each crossing upward through zero once
		let upward_crossings = 0;
		for (let i = 1; i < shape.length; i++) {
			if (shape[i - 1]! <= 0 && shape[i]! > 0) upward_crossings++;
		}
		assert.strictEqual(upward_crossings, 5);
	});

	test('swings both ways evenly, so it has almost no offset', () => {
		const shape = create_pulse_pip_shape(48000, 2000);
		const mean = shape.reduce((sum, v) => sum + v, 0) / shape.length;
		assert_close(mean, 0, 1e-3);
	});
});

describe('create_pulse_gate_shape', () => {
	test('is on for half of a period', () => {
		assert.strictEqual(create_pulse_gate_shape(48000, 40).length, 600);
		assert.strictEqual(create_pulse_gate_shape(48000, 100).length, 240);
	});

	test('ramps up and down at the edges and holds full between', () => {
		const shape = create_pulse_gate_shape(48000, 40, 0.001);
		assert.ok(shape[0]! < 0.01);
		assert.ok(shape.at(-1)! < 0.01);
		for (let i = 1; i < 48; i++) assert.ok(shape[i]! > shape[i - 1]!);
		for (let i = 48; i < 600 - 48; i++) assert.strictEqual(shape[i], 1);
		for (let i = 0; i < 48; i++) assert_close(shape[i]!, shape[599 - i]!);
	});

	test('shortens the ramps to fit a gate that is too brief for them', () => {
		const shape = create_pulse_gate_shape(1000, 100, 0.01);
		assert.strictEqual(shape.length, 5);
		assert.strictEqual(shape[2], 1);
		assert.ok(shape[0]! < shape[1]! && shape[1]! < 1);
		assert_close(shape[0]!, shape[4]!);
	});
});

describe('create_pulse_train_samples', () => {
	const click = create_pulse_click_shape(48000);

	test('spaces pulses evenly when the period is a whole number of samples', () => {
		const samples = create_pulse_train_samples(48000, 40, click);
		assert.strictEqual(samples.length, 48000);
		const starts = find_pulse_starts(samples);
		assert.strictEqual(starts.length, 40);
		starts.forEach((start, i) => assert.strictEqual(start, i * 1200));
	});

	test('places the shape at each pulse and leaves silence between', () => {
		const shape = new Float32Array([0.25, 0.5, -1]);
		const samples = create_pulse_train_samples(1000, 100, shape);
		assert.strictEqual(samples.length, 1000);
		for (let i = 0; i < samples.length; i++) {
			assert.strictEqual(samples[i], i % 10 < 3 ? shape[i % 10] : 0);
		}
	});

	test('keeps the rate exact when the period is a fraction of a sample', () => {
		const samples = create_pulse_train_samples(44100, 40, create_pulse_click_shape(44100));
		// one rounded period would be 1102 or 1103 samples and loop at the wrong rate
		assert.strictEqual(samples.length, 44100);
		const starts = find_pulse_starts(samples);
		assert.strictEqual(starts.length, 40);
		starts.forEach((start, i) => assert.ok(Math.abs(start - i * 1102.5) <= 0.5));
	});

	const rate_cases: Array<[sample_rate: number, rate: number]> = [
		[44100, PULSE_RATE_MIN],
		[44100, 1.4],
		[44100, 37.3],
		[48000, 99.9],
		[96000, PULSE_RATE_MAX]
	];
	test.each(rate_cases)(
		'loops at the requested rate, %i samples/s at %f Hz',
		(sample_rate, rate) => {
			const samples = create_pulse_train_samples(
				sample_rate,
				rate,
				create_pulse_click_shape(sample_rate)
			);
			const starts = find_pulse_starts(samples);
			const looped_rate = (starts.length * sample_rate) / samples.length;
			assert.ok(Math.abs(looped_rate - rate) / rate < 1e-4);
			// the gap that wraps around the loop matches the others to within a sample
			const period = sample_rate / rate;
			const wrap_gap = samples.length - starts.at(-1)!;
			assert.ok(Math.abs(wrap_gap - period) <= 1);
		}
	);

	test('cuts off a shape that runs past the end of the loop', () => {
		const samples = create_pulse_train_samples(1000, 1, new Float32Array(1500).fill(1));
		assert.strictEqual(samples.length, 1000);
		assert.ok(samples.every((v) => v === 1));
	});

	test('fits the longest shapes at the fastest rate', () => {
		for (const sample_rate of [44100, 48000]) {
			const period = sample_rate / PULSE_RATE_MAX;
			assert.ok(create_pulse_pip_shape(sample_rate, 440).length <= period);
			assert.ok(create_pulse_gate_shape(sample_rate, PULSE_RATE_MAX).length <= period);
		}
	});
});

describe('create_pulse_noise_samples', () => {
	test('fills the duration and peaks at full scale', () => {
		const samples = create_pulse_noise_samples(8000, create_random_alea('noise'), 0.5);
		assert.strictEqual(samples.length, 4000);
		assert_close(to_peak(samples), 1);
	});

	test('is deterministic for a given random', () => {
		assert.deepEqual(
			create_pulse_noise_samples(8000, create_random_alea('a'), 0.25),
			create_pulse_noise_samples(8000, create_random_alea('a'), 0.25)
		);
		assert.notDeepEqual(
			create_pulse_noise_samples(8000, create_random_alea('a'), 0.25),
			create_pulse_noise_samples(8000, create_random_alea('b'), 0.25)
		);
	});

	test('has more energy in the low frequencies than white noise does', () => {
		// white noise changes as much from one sample to the next as its own size, pink far less
		const samples = create_pulse_noise_samples(48000, create_random_alea('pink'), 1);
		let power = 0;
		let difference_power = 0;
		for (let i = 1; i < samples.length; i++) {
			power += samples[i]! ** 2;
			difference_power += (samples[i]! - samples[i - 1]!) ** 2;
		}
		assert.ok(difference_power < power);
	});

	test('wraps around without a jump at the seam', () => {
		const samples = create_pulse_noise_samples(48000, create_random_alea('seam'), 1);
		let largest_step = 0;
		for (let i = 1; i < samples.length; i++) {
			largest_step = Math.max(largest_step, Math.abs(samples[i]! - samples[i - 1]!));
		}
		assert.ok(Math.abs(samples[0]! - samples.at(-1)!) <= largest_step);
	});
});

describe('start_pulse', () => {
	test('fades the output in to the volume', () => {
		const audio = create_fake_pulse_audio();
		start_pulse(audio.ac, { sound: 'click', rate: 40, volume: 0.5 });
		const output = audio.gains[0]!;
		assert.deepEqual(output.gain.setValueAtTime.mock.calls, [[0, 0]]);
		assert.deepEqual(output.gain.setTargetAtTime.mock.calls, [
			[volume_to_gain(0.5), 0, SMOOTH_GAIN_TIME_CONSTANT]
		]);
		assert.deepEqual(output.connect.mock.calls, [[audio.ac.destination]]);
	});

	test('click loops a buffer of clicks into the output', () => {
		const audio = create_fake_pulse_audio(48000);
		start_pulse(audio.ac, { sound: 'click', rate: 40 });
		assert.strictEqual(audio.oscillators.length, 0);
		assert.strictEqual(audio.buffer_sources.length, 1);
		const source = audio.buffer_sources[0]!;
		assert.ok(source.loop);
		assert.ok(source.buffer?.samples);
		assert.deepEqual(
			source.buffer.samples,
			create_pulse_train_samples(48000, 40, create_pulse_click_shape(48000))
		);
		assert.strictEqual(source.buffer.sampleRate, 48000);
		assert.deepEqual(source.connect.mock.calls, [[audio.gains[0]]]);
		assert.deepEqual(source.start.mock.calls, [[0]]);
	});

	test('click swaps its buffer when the rate changes', () => {
		const audio = create_fake_pulse_audio(48000);
		const voice = start_pulse(audio.ac, { sound: 'click', rate: 40 });
		audio.set_time(3);
		voice.set_rate(20);
		assert.strictEqual(audio.buffer_sources.length, 2);
		const [first, second] = audio.buffer_sources as [any, any];
		assert.deepEqual(first.stop.mock.calls, [[3]]);
		assert.deepEqual(second.start.mock.calls, [[3]]);
		assert.deepEqual(
			second.buffer.samples,
			create_pulse_train_samples(48000, 20, create_pulse_click_shape(48000))
		);
		assert.strictEqual(second.stop.mock.calls.length, 0);
	});

	test('tone modulates the loudness of a carrier at the rate', () => {
		const audio = create_fake_pulse_audio();
		start_pulse(audio.ac, { sound: 'tone', rate: 40 });
		assert.strictEqual(audio.buffer_sources.length, 0);
		const [carrier, modulator] = audio.oscillators;
		assert.ok(carrier && modulator);
		assert.deepEqual(carrier.frequency.setValueAtTime.mock.calls, [[440, 0]]);
		assert.deepEqual(modulator.frequency.setValueAtTime.mock.calls, [[40, 0]]);
		const [output, envelope, depth] = audio.gains;
		assert.ok(output && envelope && depth);
		// the envelope rests at the depth of the swing, so the gain reaches silence without inverting
		assert.deepEqual(envelope.gain.setValueAtTime.mock.calls, depth.gain.setValueAtTime.mock.calls);
		assert.deepEqual(modulator.connect.mock.calls, [[depth]]);
		assert.deepEqual(depth.connect.mock.calls, [[envelope.gain]]);
		assert.deepEqual(carrier.connect.mock.calls, [[envelope]]);
		assert.deepEqual(envelope.connect.mock.calls, [[output]]);
		assert.strictEqual(carrier.start.mock.calls.length, 1);
		assert.strictEqual(modulator.start.mock.calls.length, 1);
	});

	test('tone glides the modulator when the rate changes', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'tone', rate: 40 });
		audio.set_time(2);
		voice.set_rate(8);
		assert.strictEqual(audio.oscillators.length, 2);
		assert.deepEqual(audio.oscillators[1]!.frequency.setTargetAtTime.mock.calls, [
			[8, 2, SMOOTH_GAIN_TIME_CONSTANT]
		]);
	});

	test('tone starts its carrier at the pitch', () => {
		const audio = create_fake_pulse_audio();
		start_pulse(audio.ac, { sound: 'tone', rate: 40, pitch: 57 });
		assert.deepEqual(audio.oscillators[0]!.frequency.setValueAtTime.mock.calls, [[220, 0]]);
	});

	test('tone glides the carrier when the pitch changes', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'tone', rate: 40 });
		audio.set_time(2);
		voice.set_pitch(81);
		assert.strictEqual(audio.oscillators.length, 2);
		assert.deepEqual(audio.oscillators[0]!.frequency.setTargetAtTime.mock.calls, [
			[880, 2, SMOOTH_GAIN_TIME_CONSTANT]
		]);
		assert.strictEqual(audio.oscillators[1]!.frequency.setTargetAtTime.mock.calls.length, 0);
	});

	test('click ignores the pitch', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'click', rate: 40, pitch: 57 });
		voice.set_pitch(81);
		assert.strictEqual(audio.oscillators.length, 0);
		assert.strictEqual(audio.buffer_sources.length, 1);
		assert.strictEqual(audio.buffer_sources[0]!.stop.mock.calls.length, 0);
	});

	test('soft_click loops a train of softened clicks', () => {
		const audio = create_fake_pulse_audio(48000);
		start_pulse(audio.ac, { sound: 'soft_click', rate: 40 });
		assert.strictEqual(audio.oscillators.length, 0);
		assert.deepEqual(
			audio.buffer_sources[0]!.buffer!.samples,
			create_pulse_train_samples(48000, 40, create_pulse_soft_click_shape(48000))
		);
	});

	test('pip loops a train of bursts at the pitch', () => {
		const audio = create_fake_pulse_audio(48000);
		start_pulse(audio.ac, { sound: 'pip', rate: 40, pitch: 81 });
		assert.strictEqual(audio.oscillators.length, 0);
		assert.deepEqual(
			audio.buffer_sources[0]!.buffer!.samples,
			create_pulse_train_samples(48000, 40, create_pulse_pip_shape(48000, 880))
		);
	});

	test('pip swaps its buffer when the pitch or rate changes, keeping both', () => {
		const audio = create_fake_pulse_audio(48000);
		const voice = start_pulse(audio.ac, { sound: 'pip', rate: 40, pitch: 81 });
		audio.set_time(1);
		voice.set_pitch(57);
		audio.set_time(2);
		voice.set_rate(20);
		assert.strictEqual(audio.buffer_sources.length, 3);
		const [first, second, third] = audio.buffer_sources as [any, any, any];
		assert.deepEqual(first.stop.mock.calls, [[1]]);
		assert.deepEqual(second.start.mock.calls, [[1]]);
		assert.deepEqual(
			second.buffer.samples,
			create_pulse_train_samples(48000, 40, create_pulse_pip_shape(48000, 220))
		);
		assert.deepEqual(second.stop.mock.calls, [[2]]);
		assert.deepEqual(
			third.buffer.samples,
			create_pulse_train_samples(48000, 20, create_pulse_pip_shape(48000, 220))
		);
	});

	test('gated_tone switches a carrier on and off with a looping gate', () => {
		const audio = create_fake_pulse_audio(48000);
		start_pulse(audio.ac, { sound: 'gated_tone', rate: 40, pitch: 57 });
		assert.strictEqual(audio.oscillators.length, 1);
		const carrier = audio.oscillators[0]!;
		assert.deepEqual(carrier.frequency.setValueAtTime.mock.calls, [[220, 0]]);
		const [output, envelope, depth] = audio.gains;
		assert.ok(output && envelope && depth);
		// the envelope rests at silence and the gate lifts it to the tone level
		assert.deepEqual(envelope.gain.setValueAtTime.mock.calls, [[0, 0]]);
		assert.deepEqual(depth.gain.setValueAtTime.mock.calls, [[PULSE_TONE_LEVEL, 0]]);
		assert.deepEqual(depth.connect.mock.calls, [[envelope.gain]]);
		assert.deepEqual(carrier.connect.mock.calls, [[envelope]]);
		assert.deepEqual(envelope.connect.mock.calls, [[output]]);
		const gate = audio.buffer_sources[0]!;
		assert.ok(gate.loop);
		assert.deepEqual(gate.connect.mock.calls, [[depth]]);
		assert.deepEqual(
			gate.buffer!.samples,
			create_pulse_train_samples(48000, 40, create_pulse_gate_shape(48000, 40))
		);
	});

	test('gated_tone swaps its gate when the rate changes and glides its pitch', () => {
		const audio = create_fake_pulse_audio(48000);
		const voice = start_pulse(audio.ac, { sound: 'gated_tone', rate: 40 });
		audio.set_time(1);
		voice.set_rate(10);
		voice.set_pitch(81);
		assert.strictEqual(audio.oscillators.length, 1);
		assert.strictEqual(audio.buffer_sources.length, 2);
		assert.deepEqual(audio.buffer_sources[0]!.stop.mock.calls, [[1]]);
		assert.deepEqual(
			audio.buffer_sources[1]!.buffer!.samples,
			create_pulse_train_samples(48000, 10, create_pulse_gate_shape(48000, 10))
		);
		assert.deepEqual(audio.oscillators[0]!.frequency.setTargetAtTime.mock.calls, [
			[880, 1, SMOOTH_GAIN_TIME_CONSTANT]
		]);
	});

	test('noise swells a loop of noise at the rate', () => {
		const audio = create_fake_pulse_audio(8000);
		start_pulse(audio.ac, { sound: 'noise', rate: 40, random: create_random_alea('noise') });
		const [output, envelope, depth] = audio.gains;
		assert.ok(output && envelope && depth);
		const noise = audio.buffer_sources[0]!;
		assert.ok(noise.loop);
		assert.deepEqual(noise.connect.mock.calls, [[envelope]]);
		assert.deepEqual(
			noise.buffer!.samples,
			create_pulse_noise_samples(8000, create_random_alea('noise'))
		);
		// the noise swells to full, not to the tone level
		assert.deepEqual(envelope.gain.setValueAtTime.mock.calls, [[0.5, 0]]);
		assert.deepEqual(depth.gain.setValueAtTime.mock.calls, [[0.5, 0]]);
		assert.strictEqual(audio.oscillators.length, 1);
		const modulator = audio.oscillators[0]!;
		assert.deepEqual(modulator.frequency.setValueAtTime.mock.calls, [[40, 0]]);
		assert.deepEqual(modulator.connect.mock.calls, [[depth]]);
		assert.deepEqual(depth.connect.mock.calls, [[envelope.gain]]);
	});

	test('noise glides its modulator when the rate changes and ignores the pitch', () => {
		const audio = create_fake_pulse_audio(8000);
		const voice = start_pulse(audio.ac, { sound: 'noise', rate: 40 });
		audio.set_time(1);
		voice.set_rate(8);
		voice.set_pitch(81);
		assert.strictEqual(audio.buffer_sources.length, 1);
		assert.deepEqual(audio.oscillators[0]!.frequency.setTargetAtTime.mock.calls, [
			[8, 1, SMOOTH_GAIN_TIME_CONSTANT]
		]);
	});

	const stop_cases: Array<[sound: PulseSound]> = pulse_sounds.map((sound) => [sound]);
	test.each(stop_cases)('stop ends every source of %s after the fade', (sound) => {
		const audio = create_fake_pulse_audio(8000);
		const voice = start_pulse(audio.ac, { sound, rate: 40 });
		audio.set_time(4);
		voice.stop();
		const sources = [...audio.oscillators, ...audio.buffer_sources];
		assert.ok(sources.length > 0);
		for (const source of sources) {
			assert.strictEqual(source.stop.mock.calls.length, 1);
			assert.ok(source.stop.mock.calls[0]![0]! > 4);
		}
	});

	test('set_volume retargets the output gain', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'click', rate: 40, volume: 0.5 });
		audio.set_time(1);
		voice.set_volume(0.9);
		assert.deepEqual(audio.gains[0]!.gain.setTargetAtTime.mock.calls.at(-1), [
			volume_to_gain(0.9),
			1,
			SMOOTH_GAIN_TIME_CONSTANT
		]);
	});

	test('stop fades out before stopping the sources', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'tone', rate: 40 });
		audio.set_time(4);
		voice.stop();
		assert.deepEqual(audio.gains[0]!.gain.setTargetAtTime.mock.calls.at(-1), [
			0,
			4,
			SMOOTH_GAIN_TIME_CONSTANT
		]);
		for (const oscillator of audio.oscillators) {
			assert.strictEqual(oscillator.stop.mock.calls.length, 1);
			assert.ok(oscillator.stop.mock.calls[0]![0]! > 4);
		}
	});

	test('a stopped voice ignores further calls', () => {
		const audio = create_fake_pulse_audio();
		const voice = start_pulse(audio.ac, { sound: 'click', rate: 40 });
		voice.stop();
		const output_calls = audio.gains[0]!.gain.setTargetAtTime.mock.calls.length;
		voice.stop();
		voice.set_rate(20);
		voice.set_pitch(60);
		voice.set_volume(1);
		assert.strictEqual(audio.buffer_sources.length, 1);
		assert.strictEqual(audio.buffer_sources[0]!.stop.mock.calls.length, 1);
		assert.strictEqual(audio.gains[0]!.gain.setTargetAtTime.mock.calls.length, output_calls);
	});
});

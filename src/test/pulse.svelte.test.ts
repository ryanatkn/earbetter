import { test, assert, vi, beforeEach, afterEach } from 'vitest';

import { SMOOTH_GAIN_TIME_CONSTANT, volume_to_gain } from '#lib/audio_helpers.ts';
import { DEFAULT_PULSE_PITCH, DEFAULT_PULSE_RATE, DEFAULT_PULSE_SOUND } from '#lib/pulse.ts';
import { Pulse } from '#lib/pulse.svelte.ts';
import { create_memory_storage } from './test_helpers.ts';
import { create_fake_pulse_audio, type FakePulseAudio } from './pulse_test_helpers.ts';

const TEST_STORAGE_KEY = 'pulse';

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
});
afterEach(() => {
	vi.unstubAllGlobals();
});

const create_pulse = (audio: FakePulseAudio = create_fake_pulse_audio()): Pulse =>
	new Pulse(() => audio.ac, { storage_key: TEST_STORAGE_KEY });

const read_stored = (): any => {
	const value = localStorage.getItem(TEST_STORAGE_KEY);
	return value === null ? null : JSON.parse(value);
};

test('starts with the defaults and writes nothing', () => {
	const pulse = create_pulse();
	assert.strictEqual(pulse.rate, DEFAULT_PULSE_RATE);
	assert.strictEqual(pulse.sound, DEFAULT_PULSE_SOUND);
	assert.ok(!pulse.playing);
	assert.strictEqual(read_stored(), null);
});

test('loads stored data, filling defaults and stripping unknown keys', () => {
	localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify({ rate: 12, removed_setting: true }));
	const pulse = create_pulse();
	assert.deepEqual(pulse.toJSON(), {
		rate: 12,
		sound: DEFAULT_PULSE_SOUND,
		pitch: DEFAULT_PULSE_PITCH
	});
});

test('falls back to the defaults when stored data is invalid', () => {
	localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify({ rate: 5000 }));
	const pulse = create_pulse();
	assert.strictEqual(pulse.rate, DEFAULT_PULSE_RATE);
});

test('saves the rate, sound, and pitch on write', () => {
	const pulse = create_pulse();
	pulse.rate = 10;
	assert.deepEqual(read_stored(), {
		rate: 10,
		sound: DEFAULT_PULSE_SOUND,
		pitch: DEFAULT_PULSE_PITCH
	});
	pulse.sound = 'tone';
	pulse.pitch = 57;
	assert.deepEqual(read_stored(), { rate: 10, sound: 'tone', pitch: 57 });
});

test('ignores an invalid pitch', () => {
	const pulse = create_pulse();
	pulse.pitch = 500;
	pulse.pitch = 60.5;
	pulse.pitch = null as any; // a cleared number input
	assert.strictEqual(pulse.pitch, DEFAULT_PULSE_PITCH);
	assert.strictEqual(read_stored(), null);
});

test('changing the pitch while playing adjusts the sound without restarting', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.sound = 'tone';
	pulse.start();
	pulse.pitch = 57;
	assert.ok(pulse.playing);
	assert.strictEqual(audio.oscillators.length, 2);
	assert.strictEqual(audio.oscillators[0]!.frequency.setTargetAtTime.mock.calls[0]![0], 220);
});

test('ignores an invalid rate', () => {
	const pulse = create_pulse();
	pulse.rate = 5000;
	pulse.rate = 0;
	pulse.rate = null as any; // a cleared number input
	assert.strictEqual(pulse.rate, DEFAULT_PULSE_RATE);
	assert.strictEqual(read_stored(), null);
});

test('start and stop toggle playing', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.start();
	assert.ok(pulse.playing);
	assert.strictEqual(audio.buffer_sources.length, 1);
	pulse.start(); // already playing
	assert.strictEqual(audio.buffer_sources.length, 1);
	pulse.stop();
	assert.ok(!pulse.playing);
	assert.strictEqual(audio.buffer_sources[0]!.stop.mock.calls.length, 1);
	pulse.stop(); // already stopped
	assert.strictEqual(audio.buffer_sources[0]!.stop.mock.calls.length, 1);
});

test('toggle starts and then stops', () => {
	const pulse = create_pulse();
	pulse.toggle();
	assert.ok(pulse.playing);
	pulse.toggle();
	assert.ok(!pulse.playing);
});

test('does not touch the audio context until started', () => {
	const get_audio_context = vi.fn(() => create_fake_pulse_audio().ac);
	const pulse = new Pulse(get_audio_context, { storage_key: TEST_STORAGE_KEY });
	pulse.rate = 10;
	pulse.sound = 'tone';
	pulse.volume = 0.2;
	pulse.stop();
	assert.strictEqual(get_audio_context.mock.calls.length, 0);
	pulse.start();
	assert.strictEqual(get_audio_context.mock.calls.length, 1);
});

test('starts with the current rate, sound, and volume', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.rate = 8;
	pulse.sound = 'tone';
	pulse.pitch = 57;
	pulse.volume = 0.2;
	pulse.start();
	assert.deepEqual(audio.oscillators[0]!.frequency.setValueAtTime.mock.calls, [[220, 0]]);
	assert.deepEqual(audio.oscillators[1]!.frequency.setValueAtTime.mock.calls, [[8, 0]]);
	assert.deepEqual(audio.gains[0]!.gain.setTargetAtTime.mock.calls, [
		[volume_to_gain(0.2), 0, SMOOTH_GAIN_TIME_CONSTANT]
	]);
});

test('changing the rate while playing adjusts the sound without restarting', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.sound = 'tone';
	pulse.start();
	pulse.rate = 8;
	assert.ok(pulse.playing);
	assert.strictEqual(audio.oscillators.length, 2);
	assert.strictEqual(audio.oscillators[1]!.frequency.setTargetAtTime.mock.calls[0]![0], 8);
});

test('changing the sound while playing restarts with the new sound', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.start();
	pulse.sound = 'tone';
	assert.ok(pulse.playing);
	assert.strictEqual(audio.buffer_sources[0]!.stop.mock.calls.length, 1);
	assert.strictEqual(audio.oscillators.length, 2);
});

test('changing the sound while stopped stays stopped', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.sound = 'tone';
	assert.ok(!pulse.playing);
	assert.strictEqual(audio.oscillators.length, 0);
});

test('changing the volume while playing retargets the output', () => {
	const audio = create_fake_pulse_audio();
	const pulse = create_pulse(audio);
	pulse.start();
	pulse.volume = 0.9;
	assert.strictEqual(pulse.volume, 0.9);
	assert.strictEqual(
		audio.gains[0]!.gain.setTargetAtTime.mock.calls.at(-1)![0],
		volume_to_gain(0.9)
	);
});

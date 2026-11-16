import * as s from '@fuzdev/fuz_schema/schema.ts';
import { describe, test, assert } from 'vitest';

import {
	adjust_volume,
	DEFAULT_VELOCITY,
	DEFAULT_VOLUME,
	instruments,
	Volume,
	volume_to_gain,
	with_velocity
} from '#lib/audio_helpers.ts';

describe('Volume', () => {
	test('rounds to two decimals', () => {
		assert.strictEqual(s.parse_or_throw(Volume, 0.123456), 0.12);
		assert.strictEqual(s.parse_or_throw(Volume, 0.59 + 0.01), 0.6);
	});

	test('rejects out of range', () => {
		assert.ok(!s.parse(Volume, -0.01).ok);
		assert.ok(!s.parse(Volume, 1.01).ok);
	});
});

describe('adjust_volume', () => {
	test('steps by the increment', () => {
		const state = { volume: DEFAULT_VOLUME };
		adjust_volume(state);
		assert.strictEqual(state.volume, 0.6);
		adjust_volume(state, -2);
		assert.strictEqual(state.volume, 0.58);
	});

	test('accumulates without float drift', () => {
		const state = { volume: 0 };
		for (let i = 0; i < 100; i++) adjust_volume(state);
		assert.strictEqual(state.volume, 1);
	});

	test('stays put at the bounds', () => {
		const max = { volume: 1 };
		adjust_volume(max);
		assert.strictEqual(max.volume, 1);
		const min = { volume: 0 };
		adjust_volume(min, -1);
		assert.strictEqual(min.volume, 0);
	});

	test('a custom amount', () => {
		const state = { volume: 0.5 };
		adjust_volume(state, 1, 0.25);
		assert.strictEqual(state.volume, 0.75);
	});
});

describe('with_velocity', () => {
	test('scales by the square root of velocity', () => {
		assert.strictEqual(with_velocity(0.8, 1), 0.8);
		assert.strictEqual(with_velocity(0.8, 0.25), 0.4);
		assert.strictEqual(with_velocity(0.8, 0), 0);
	});

	test('falls back to the default velocity', () => {
		assert.strictEqual(with_velocity(1, null), Math.sqrt(DEFAULT_VELOCITY));
		assert.strictEqual(with_velocity(1, undefined), Math.sqrt(DEFAULT_VELOCITY));
	});
});

describe('volume_to_gain', () => {
	test('fixes the endpoints and curves below linear', () => {
		assert.strictEqual(volume_to_gain(0), 0);
		assert.strictEqual(volume_to_gain(1), 1);
		assert.ok(volume_to_gain(0.5) < 0.5);
	});

	test('is monotonic', () => {
		let prev = -1;
		for (let v = 0; v <= 1; v += 0.01) {
			const gain = volume_to_gain(v);
			assert.ok(gain > prev);
			prev = gain;
		}
	});
});

test('instruments are valid oscillator types', () => {
	assert.deepEqual(instruments, ['sawtooth', 'sine', 'square', 'triangle']);
});

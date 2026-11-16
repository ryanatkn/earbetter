import { describe, test, assert } from 'vitest';

import { compute_piano } from '#lib/piano.ts';
import { midi_naturals, type Midi } from '#lib/music.ts';

const ranges: Array<[label: string, min: Midi, max: Midi]> = [
	['one octave from C', 60, 72],
	['full 88-key range', 21, 108],
	['starts and ends on accidentals', 61, 70],
	['single natural', 60, 60],
	['single accidental', 61, 61]
];

describe('compute_piano', () => {
	test.each(ranges)('%s has a key per note in order', (_label, min, max) => {
		const piano = compute_piano(1000, min, max);
		assert.deepEqual(
			piano.piano_keys.map((k) => k.note),
			Array.from({ length: max - min + 1 }, (_, i) => min + i)
		);
	});

	test.each(ranges)('%s sizes keys by type', (_label, min, max) => {
		const piano = compute_piano(1000, min, max);
		for (const key of piano.piano_keys) {
			if (midi_naturals.has(key.note)) {
				assert.strictEqual(key.width, piano.natural_key_width);
				assert.strictEqual(key.height, piano.natural_key_height);
			} else {
				assert.strictEqual(key.width, piano.accidental_key_width);
				assert.strictEqual(key.height, piano.accidental_key_height);
			}
		}
		assert.ok(piano.accidental_key_width < piano.natural_key_width);
		assert.ok(piano.accidental_key_height < piano.natural_key_height);
	});

	test.each(ranges)('%s tiles naturals left to right within the width', (_label, min, max) => {
		const width = 1000;
		const piano = compute_piano(width, min, max);
		const naturals = piano.piano_keys.filter((k) => midi_naturals.has(k.note));
		for (let i = 1; i < naturals.length; i++) {
			assert.closeTo(
				naturals[i]!.left_offset - naturals[i - 1]!.left_offset,
				piano.natural_key_width,
				1e-9
			);
		}
		for (const key of piano.piano_keys) {
			assert.ok(key.left_offset >= 0, `${key.note} starts inside`);
			assert.ok(key.left_offset + key.width <= width, `${key.note} ends inside`);
		}
	});

	test('accidentals sit over the boundary of their neighbors', () => {
		const piano = compute_piano(1000, 60, 72);
		const by_note = new Map(piano.piano_keys.map((k) => [k.note, k]));
		for (const key of piano.piano_keys) {
			if (midi_naturals.has(key.note)) continue;
			const right = by_note.get(key.note + 1)!;
			assert.ok(key.left_offset < right.left_offset, `${key.note}`);
			assert.ok(key.left_offset + key.width > right.left_offset, `${key.note}`);
		}
	});

	test('caps the height', () => {
		const piano = compute_piano(100_000, 60, 72, 300);
		assert.strictEqual(piano.natural_key_height, 300);
		assert.strictEqual(piano.accidental_key_height, 210);
	});

	test('integer pixel sizes', () => {
		const piano = compute_piano(997, 21, 108);
		for (const n of [
			piano.natural_key_width,
			piano.natural_key_height,
			piano.accidental_key_width,
			piano.accidental_key_height
		]) {
			assert.ok(Number.isInteger(n));
		}
	});

	test('an inverted range is empty', () => {
		const piano = compute_piano(1000, 72, 60);
		assert.deepEqual(piano.piano_keys, []);
	});
});

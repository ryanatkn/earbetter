import { describe, test, assert } from 'vitest';

import {
	DEFAULT_SCALE,
	lookup_scale,
	MIDI_MAX,
	midi_pitch_classes,
	pitch_classes,
	scale_by_name,
	scales,
	to_notes_in_scale,
	to_scale_notes,
	type PitchClass
} from '#lib/music.ts';

describe('scales', () => {
	test('notes are ascending semitones within one octave', () => {
		for (const scale of scales) {
			const { notes } = scale;
			assert.ok(notes.length > 0, scale.name);
			for (let i = 0; i < notes.length; i++) {
				assert.ok(notes[i]! > 0 && notes[i]! < 12, scale.name);
				if (i > 0) assert.ok(notes[i]! > notes[i - 1]!, scale.name);
			}
		}
	});

	test('names are unique and indexed', () => {
		assert.strictEqual(scale_by_name.size, scales.length);
		assert.strictEqual(DEFAULT_SCALE.name, 'chromatic');
	});

	test('the seven modes have seven notes', () => {
		for (const name of [
			'major',
			'minor',
			'Dorian',
			'Phrygian',
			'Lydian',
			'Mixolydian',
			'Locrian'
		]) {
			assert.strictEqual(lookup_scale(name).notes.length + 1, 7, name);
		}
	});

	test('lookup_scale throws for an unknown name', () => {
		assert.throws(() => lookup_scale('nope'), 'unknown scale nope');
	});
});

describe('to_scale_notes', () => {
	const cases: Array<[scale: string, octaves: number, expected: Array<number>]> = [
		['major pentatonic', 1, [2, 4, 7, 9, 12]],
		['major pentatonic', 2, [2, 4, 7, 9, 12, -10, -8, -5, -3, -12]],
		[
			'major pentatonic',
			4,
			[2, 4, 7, 9, 12, -10, -8, -5, -3, -12, 14, 16, 19, 21, 24, -22, -20, -17, -15, -24]
		],
		['major', 2, [2, 4, 5, 7, 9, 11, 12, -10, -8, -7, -5, -3, -1, -12]],
		[
			'major',
			4,
			[
				2, 4, 5, 7, 9, 11, 12, -10, -8, -7, -5, -3, -1, -12, 14, 16, 17, 19, 21, 23, 24, -22, -20,
				-19, -17, -15, -13, -24
			]
		],
		['minor', 1, [2, 3, 5, 7, 8, 10, 12]],
		['minor', 2, [2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12]],
		[
			'minor',
			4,
			[
				2, 3, 5, 7, 8, 10, 12, -10, -9, -7, -5, -4, -2, -12, 14, 15, 17, 19, 20, 22, 24, -22, -21,
				-19, -17, -16, -14, -24
			]
		]
	];
	test.each(cases)('%s over %s octaves', (scale, octaves, expected) => {
		assert.deepEqual(to_scale_notes(lookup_scale(scale), octaves), expected);
	});

	test('zero octaves is empty', () => {
		assert.deepEqual(to_scale_notes(lookup_scale('major'), 0), []);
	});

	test('never includes the unison and has no duplicates', () => {
		for (const scale of scales) {
			const notes = to_scale_notes(scale, 4);
			assert.ok(!notes.includes(0), scale.name);
			assert.strictEqual(new Set(notes).size, notes.length, scale.name);
			assert.strictEqual(notes.length, (scale.notes.length + 1) * 4, scale.name);
		}
	});
});

describe('to_notes_in_scale', () => {
	const major = lookup_scale('major');

	test('C major over one octave', () => {
		assert.deepEqual([...to_notes_in_scale(major, 'C', 60, 72)], [60, 62, 64, 65, 67, 69, 71, 72]);
	});

	test('D major over one octave', () => {
		assert.deepEqual([...to_notes_in_scale(major, 'D', 62, 74)], [62, 64, 66, 67, 69, 71, 73, 74]);
	});

	// regression: the key offset was computed relative to `min_note`,
	// so a range not starting on C shifted the whole scale
	const range_cases: Array<[label: string, key: PitchClass, min: number, max: number]> = [
		['C major starting on C♯', 'C', 1, 14],
		['C major starting on B', 'C', 59, 72],
		['D major starting on F', 'D', 5, 20],
		['B♭ major starting on E', 'A♯', 40, 64],
		['G major starting on A♯', 'G', 70, 95]
	];
	test.each(range_cases)('%s matches the full-range scale', (_label, key, min, max) => {
		const full = to_notes_in_scale(major, key);
		const ranged = [...to_notes_in_scale(major, key, min, max)];
		assert.deepEqual(
			ranged,
			[...full].filter((n) => n >= min && n <= max)
		);
	});

	test('every note is in the key for every scale and key', () => {
		for (const scale of scales) {
			for (const key of pitch_classes) {
				const key_index = pitch_classes.indexOf(key);
				const allowed = new Set([0, ...scale.notes]);
				const notes = to_notes_in_scale(scale, key, 17, 100);
				assert.strictEqual(
					notes.size,
					[...range(17, 100)].filter((n) => allowed.has((n - key_index + 12) % 12)).length
				);
				for (const n of notes) {
					const degree = (pitch_classes.indexOf(midi_pitch_classes[n]!) - key_index + 12) % 12;
					assert.ok(allowed.has(degree), `${scale.name} in ${key}: ${n}`);
				}
			}
		}
	});

	test('the chromatic scale includes every note', () => {
		assert.strictEqual(to_notes_in_scale(lookup_scale('chromatic'), 'F♯').size, MIDI_MAX + 1);
	});

	test('an inverted range is empty', () => {
		assert.strictEqual(to_notes_in_scale(major, 'C', 72, 60).size, 0);
	});
});

function* range(min: number, max: number): Generator<number> {
	for (let i = min; i <= max; i++) yield i;
}

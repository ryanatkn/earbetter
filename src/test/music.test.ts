import { describe, test, assert } from 'vitest';

import {
	chromas,
	compute_naturals,
	DEFAULT_TUNING,
	freq_to_midi,
	freq_to_midi_safe,
	is_midi,
	MIDI_MAX,
	MIDI_MIN,
	midi_chromas,
	midi_names,
	midi_naturals,
	midi_octaves,
	midi_pitch_classes,
	midi_to_freq,
	midis,
	pitch_classes,
	transpose,
	chroma_to_hue,
	chroma_to_hsl_string,
	type Midi
} from '#lib/music.ts';

describe('midi tables', () => {
	test('cover every midi value', () => {
		assert.strictEqual(midis.length, MIDI_MAX - MIDI_MIN + 1);
		for (const table of [midi_chromas, midi_pitch_classes, midi_octaves, midi_names]) {
			assert.strictEqual(table.length, midis.length);
		}
	});

	const cases: Array<[label: string, midi: Midi, name: string, octave: number, chroma: number]> = [
		['lowest', 0, 'C-1', -1, 1],
		['first accidental', 1, 'C♯-1', -1, 2],
		['middle C', 60, 'C4', 4, 1],
		['A440', 69, 'A4', 4, 10],
		['B below middle C', 59, 'B3', 3, 12],
		['highest', 127, 'G9', 9, 8]
	];
	test.each(cases)('%s', (_label, midi, name, octave, chroma) => {
		assert.strictEqual(midi_names[midi], name);
		assert.strictEqual(midi_octaves[midi], octave);
		assert.strictEqual(midi_chromas[midi], chroma);
		assert.strictEqual(midi_pitch_classes[midi], pitch_classes[chroma - 1]);
	});

	test('names are unique', () => {
		assert.strictEqual(new Set(midi_names).size, midi_names.length);
	});

	test('naturals are the notes without a sharp', () => {
		assert.deepEqual(
			[...midi_naturals].filter((m) => m < 24),
			[0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23]
		);
		for (const m of midis) {
			assert.strictEqual(midi_naturals.has(m), !midi_names[m]!.includes('♯'), midi_names[m]);
		}
	});
});

describe('compute_naturals', () => {
	test('returns naturals in an inclusive range', () => {
		assert.deepEqual(compute_naturals(59, 65), [59, 60, 62, 64, 65]);
	});

	test('excludes accidental endpoints', () => {
		assert.deepEqual(compute_naturals(61, 63), [62]);
	});

	test('returns empty for an inverted range', () => {
		assert.deepEqual(compute_naturals(65, 59), []);
	});
});

describe('is_midi', () => {
	const cases: Array<[value: number, expected: boolean]> = [
		[0, true],
		[127, true],
		[60, true],
		[-1, false],
		[128, false],
		[60.5, false],
		[NaN, false],
		[Infinity, false]
	];
	test.each(cases)('%s → %s', (value, expected) => {
		assert.strictEqual(is_midi(value), expected);
	});
});

describe('transpose', () => {
	test('shifts by semitones', () => {
		assert.strictEqual(transpose(60, 7), 67);
		assert.strictEqual(transpose(60, -12), 48);
	});

	test('returns null out of range', () => {
		assert.strictEqual(transpose(120, 8), null);
		assert.strictEqual(transpose(3, -4), null);
	});

	test('allows the boundaries', () => {
		assert.strictEqual(transpose(120, 7), 127);
		assert.strictEqual(transpose(3, -3), 0);
	});
});

describe('frequency', () => {
	test('A4 is the tuning', () => {
		assert.strictEqual(midi_to_freq(69), DEFAULT_TUNING);
		assert.strictEqual(midi_to_freq(69, 432), 432);
	});

	test('an octave doubles the frequency', () => {
		assert.closeTo(midi_to_freq(81) / midi_to_freq(69), 2, 1e-12);
		assert.closeTo(midi_to_freq(60), 261.6256, 1e-4);
	});

	test('round-trips every midi value', () => {
		for (const m of midis) {
			assert.strictEqual(freq_to_midi(midi_to_freq(m), DEFAULT_TUNING), m);
		}
	});

	test('round-trips under another tuning', () => {
		for (const m of midis) {
			assert.strictEqual(freq_to_midi(midi_to_freq(m, 415), 415), m);
		}
	});

	test('rounds to the nearest note', () => {
		assert.strictEqual(freq_to_midi(450, DEFAULT_TUNING), 69);
		assert.strictEqual(freq_to_midi(460, DEFAULT_TUNING), 70);
	});

	test('freq_to_midi_safe returns null out of range', () => {
		assert.strictEqual(freq_to_midi_safe(5, DEFAULT_TUNING), null);
		assert.strictEqual(freq_to_midi_safe(20_000, DEFAULT_TUNING), null);
		assert.strictEqual(freq_to_midi_safe(DEFAULT_TUNING, DEFAULT_TUNING), 69);
	});
});

describe('chroma colors', () => {
	test('every chroma has a distinct hue in [0, 1)', () => {
		const hues = chromas.map((c) => chroma_to_hue.get(c));
		assert.strictEqual(new Set(hues).size, chromas.length);
		for (const hue of hues) {
			assert.ok(hue !== undefined && hue >= 0 && hue < 1);
		}
		assert.strictEqual(chroma_to_hsl_string.size, chromas.length);
	});
});

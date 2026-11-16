import { SvelteSet } from 'svelte/reactivity';
import { assert, vi } from 'vitest';

import { DEFAULT_INSTRUMENT, DEFAULT_VOLUME } from '#lib/audio_helpers.ts';
import { freq_to_midi, DEFAULT_TUNING, type Midi } from '#lib/music.ts';
import type { LevelAudioState } from '#lib/earbetter/level.svelte.ts';

export interface FakeAudioContext {
	ac: AudioContext;
	/**
	 * Every note started on an oscillator, in order, recovered from its frequency.
	 */
	played: Array<Midi>;
}

/**
 * Creates the slice of `AudioContext` that `play_note` touches,
 * recording each started note so tests can assert what the player heard.
 */
export const create_fake_audio_context = (): FakeAudioContext => {
	const played: Array<Midi> = [];
	const create_param = () => ({ value: 0, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn() });
	const ac = {
		currentTime: 0,
		destination: {},
		createGain: () => ({ gain: create_param(), connect: vi.fn() }),
		createOscillator: () => {
			const frequency = create_param();
			return {
				type: 'sine',
				frequency,
				connect: vi.fn(),
				start: () => {
					const freq = frequency.setValueAtTime.mock.calls[0]?.[0];
					if (typeof freq === 'number') played.push(freq_to_midi(freq, DEFAULT_TUNING));
				},
				stop: vi.fn()
			};
		}
	};
	return { ac: ac as unknown as AudioContext, played };
};

export const create_level_audio_state = (): LevelAudioState => ({
	playing_notes: new SvelteSet(),
	volume: DEFAULT_VOLUME,
	instrument: DEFAULT_INSTRUMENT
});

/**
 * Returns a `random` that yields `values` in order and then throws,
 * so a test fails loudly if the code draws more randomness than it scripted.
 */
export const create_scripted_random = (values: Array<number>): (() => number) => {
	let i = 0;
	return () => {
		if (i >= values.length) throw Error(`scripted random exhausted after ${values.length} values`);
		return values[i++]!;
	};
};

/**
 * Returns the `random` value that makes belt's `random_int(min, max, random)` pick `value`.
 */
export const to_random_for_int = (min: number, max: number, value: number): number =>
	(value - min + 0.5) / (max - min + 1);

/**
 * Creates an in-memory `Storage` for stubbing `localStorage`.
 */
export const create_memory_storage = (initial: Record<string, string> = {}): Storage => {
	const map = new Map(Object.entries(initial));
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (key) => map.get(key) ?? null,
		key: (index) => Array.from(map.keys())[index] ?? null,
		removeItem: (key) => {
			map.delete(key);
		},
		setItem: (key, value) => {
			map.set(key, value);
		}
	};
};

/**
 * Asserts that `fn` rejects with an `Error` whose message matches `pattern`, returning the error.
 */
export const assert_rejects = async (
	fn: () => Promise<unknown>,
	pattern?: RegExp
): Promise<Error> => {
	try {
		await fn();
	} catch (err) {
		assert(err instanceof Error);
		if (pattern) assert.match(err.message, pattern);
		return err;
	}
	assert.fail('expected a rejection');
};

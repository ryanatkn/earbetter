import * as s from '@fuzdev/fuz_schema/schema.ts';

import type { GetAudioContext } from './audio_context.ts';
import { DEFAULT_VOLUME, type Volume } from './audio_helpers.ts';
import {
	DEFAULT_PULSE_PITCH,
	DEFAULT_PULSE_RATE,
	DEFAULT_PULSE_SOUND,
	PulsePitch,
	PulseRate,
	PulseSound,
	start_pulse,
	type PulseVoice
} from './pulse.ts';
import { load_from_storage, set_in_storage } from './storage.ts';

// strips unknown keys because it's persisted across versions
export const PulseData = s.strip_object({
	rate: s.with_default(PulseRate, DEFAULT_PULSE_RATE),
	sound: s.with_default(PulseSound, DEFAULT_PULSE_SOUND),
	pitch: s.with_default(PulsePitch, DEFAULT_PULSE_PITCH)
});
export type PulseData = s.Infer<typeof PulseData>;

export interface PulseOptions {
	/**
	 * The `localStorage` key for the `PulseData`.
	 */
	storage_key?: string;
}

/**
 * A continuous pulse of sound with an adjustable rate.
 *
 * Like `App`, persistence is save-on-write and changes are pushed to the playing sound
 * by the setters, so this owns no effects and needs no teardown beyond `stop`.
 */
export class Pulse {
	readonly storage_key: string;
	readonly get_audio_context: GetAudioContext;

	#data: PulseData = $state.raw()!;
	get data(): PulseData {
		return this.#data;
	}
	set data(value: PulseData) {
		this.#data = value;
		set_in_storage(this.storage_key, value);
	}

	get rate(): PulseRate {
		return this.data.rate;
	}
	/**
	 * Ignores values that aren't a valid `PulseRate`,
	 * like the `null` of a cleared number input or a typed value that's out of range.
	 */
	set rate(value: PulseRate) {
		const parsed = s.parse(PulseRate, value);
		if (!parsed.ok || parsed.value === this.data.rate) return;
		this.data = { ...this.data, rate: parsed.value };
		this.#voice?.set_rate(parsed.value);
	}

	get sound(): PulseSound {
		return this.data.sound;
	}
	set sound(sound: PulseSound) {
		if (sound === this.data.sound) return;
		this.data = { ...this.data, sound };
		if (this.playing) {
			this.stop();
			this.start();
		}
	}

	get pitch(): PulsePitch {
		return this.data.pitch;
	}
	/**
	 * Ignores values that aren't a valid `PulsePitch`, like the setter of `rate`.
	 */
	set pitch(value: PulsePitch) {
		const parsed = s.parse(PulsePitch, value);
		if (!parsed.ok || parsed.value === this.data.pitch) return;
		this.data = { ...this.data, pitch: parsed.value };
		this.#voice?.set_pitch(parsed.value);
	}

	// a plain field, not state, because nothing renders from it
	#volume: Volume = DEFAULT_VOLUME;
	get volume(): Volume {
		return this.#volume;
	}
	/**
	 * The volume belongs to whoever owns this, like the `App` and its site-wide volume,
	 * and the owner keeps this in sync.
	 */
	set volume(volume: Volume) {
		this.#volume = volume;
		this.#voice?.set_volume(volume);
	}

	#voice: PulseVoice | null = $state.raw(null);
	get playing(): boolean {
		return this.#voice !== null;
	}

	constructor(get_audio_context: GetAudioContext, options?: PulseOptions) {
		this.get_audio_context = get_audio_context;
		this.storage_key = options?.storage_key ?? 'pulse';
		// loading assigns the private field, so it doesn't write back what it just read
		this.#data = load_from_storage(
			this.storage_key,
			() => s.parse_or_throw(PulseData, {}),
			(v) => s.parse_or_throw(PulseData, v)
		);
	}

	toJSON(): PulseData {
		return this.data;
	}

	/**
	 * This should be called during a user input action like a click,
	 * like everything that first touches the `AudioContext`.
	 */
	start = (): void => {
		if (this.#voice) return;
		this.#voice = start_pulse(this.get_audio_context(), {
			sound: this.sound,
			rate: this.rate,
			pitch: this.pitch,
			volume: this.#volume
		});
	};

	stop = (): void => {
		if (!this.#voice) return;
		this.#voice.stop();
		this.#voice = null;
	};

	toggle = (): void => {
		if (this.#voice) {
			this.stop();
		} else {
			this.start();
		}
	};
}

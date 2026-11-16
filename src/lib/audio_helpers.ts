import * as s from '@fuzdev/fuz_schema/schema.ts';
import type { Flavored } from '@fuzdev/fuz_schema/schema.ts';
import { round } from '@fuzdev/fuz_util/maths.ts';

export type Frequency = Flavored<number, 'Frequency'>;
export type Milliseconds = Flavored<number, 'Milliseconds'>;
export const Volume = s.flavor(
	s.pipe(
		s.number,
		s.min_value(0),
		s.max_value(1),
		s.transform((v: number) => round(v, 2))
	),
	'Volume'
);
export type Volume = s.Infer<typeof Volume>;

export const DEFAULT_VOLUME: Volume = 0.59;
export const DEFAULT_VOLUME_INCREMENT: Volume = 0.01;
export const DEFAULT_VELOCITY = 0.47; // balances the volume between using a MIDI input and others that don't have velocity
// TODO the sqrt may be heavy handed, the goal is to normalize the volume for convenience, but idk
export const with_velocity = (volume: Volume, velocity: number | null | undefined): Volume =>
	Math.sqrt(velocity ?? DEFAULT_VELOCITY) * volume;

export const adjust_volume = (
	state: { volume: Volume },
	multiplier = 1,
	amount = DEFAULT_VOLUME_INCREMENT
): void => {
	const parsed = s.parse(Volume, state.volume + amount * multiplier);
	if (parsed.ok) state.volume = parsed.value;
};

/**
 * Convert a user-facing volume value [0,1] to the actual gain value.
 * We want some sort of nonlinear curve to match user expectations.
 * TODO why is this exponent so different from the article? this sounds better to me
 * https://www.dr-lex.be/info-stuff/volumecontrols.html
 */
export const VOLUME_TO_GAIN_EXPONENT = 2.2;
export const volume_to_gain = (volume: Volume): number => volume ** VOLUME_TO_GAIN_EXPONENT;

export const SMOOTH_GAIN_TIME_CONSTANT = 0.03;

// TODO this is `OscillatorType` excluding "custom" because it can't be used directly,
// and we'll probably add to the type union the data for `createPeriodicWave`
export const instruments = ['sawtooth', 'sine', 'square', 'triangle'] as const;
export const Instrument = s.one_of(instruments);
export type Instrument = s.Infer<typeof Instrument>;
export const DEFAULT_INSTRUMENT: Instrument = 'sine';

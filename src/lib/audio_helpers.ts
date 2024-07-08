import {z} from 'zod';
import type {Flavored} from '@ryanatkn/belt/types.js';
import {round} from '@ryanatkn/belt/maths.js';

export type Frequency = Flavored<number, 'Frequency'>;
export type Milliseconds = Flavored<number, 'Milliseconds'>;
export const Volume = z
	.number()
	.min(0)
	.max(1)
	.transform((v) => round(v, 2));
export type Volume = Flavored<z.infer<typeof Volume>, 'Volume'>; // TODO @many this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?

export const DEFAULT_VOLUME: Volume = 0.59;
export const DEFAULT_VOLUME_INCREMENT: Volume = 0.01;
export const DEFAULT_VELOCITY = 0.47; // balances the volume between using a MIDI input and others that don't have velocity
// TODO the sqrt may be heavy handed, the goal is to normalize the volume for convenience, but idk
export const with_velocity = (volume: Volume, velocity: number | null | undefined): Volume =>
	Math.sqrt(velocity ?? DEFAULT_VELOCITY) * volume;

export const adjust_volume = (
	state: {volume: Volume},
	multiplier = 1,
	amount = DEFAULT_VOLUME_INCREMENT,
): void => {
	// TODO awkward try/catch, but idk about `safeParse`
	try {
		state.volume = Volume.parse(state.volume + amount * multiplier);
	} catch (_err) {}
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
export const Instrument = z.enum(['sawtooth', 'sine', 'square', 'triangle']);
export type Instrument = z.infer<typeof Instrument>;
export const instruments: Instrument[] = Instrument.options;
export const DEFAULT_INSTRUMENT: Instrument = 'sine';

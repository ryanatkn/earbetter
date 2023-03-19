import {getContext, setContext} from 'svelte';
import {writable, type Writable} from 'svelte/store';
import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {round} from '@feltjs/util/maths.js';

export type Frequency = Flavored<number, 'Frequency'>;
export type Milliseconds = Flavored<number, 'Milliseconds'>;
export type Volume = Flavored<number, 'Volume'>;
export const Volume = z
	.number()
	.min(0)
	.max(1)
	.transform((v) => round(v, 2));

export const DEFAULT_VOLUME: Volume = 0.51;
export const DEFAULT_VOLUME_INCREMENT: Volume = 0.01;

const KEY = Symbol('volume');
export const get_volume = (): Writable<Volume> => getContext(KEY);
export const set_volume = (store = writable(DEFAULT_VOLUME)): Writable<Volume> =>
	setContext(KEY, store);

export const adjust_volume = (
	volume: Writable<Volume>,
	multiplier = 1,
	amount = DEFAULT_VOLUME_INCREMENT,
): void =>
	volume.update((v) => {
		try {
			return Volume.parse(v + amount * multiplier);
		} catch (err) {
			return v;
		}
	});

/**
 * Convert a user-facing volume value [0,1] to the actual gain value.
 * We want some sort of nonlinear curve to match user expectations.
 * TODO why is this exponent so different from the article? this sounds better to me
 * https://www.dr-lex.be/info-stuff/volumecontrols.html
 */
export const VOLUME_TO_GAIN_EXPONENT = 2.2;
export const volume_to_gain = (volume: Volume): number => volume ** VOLUME_TO_GAIN_EXPONENT;

export const SMOOTH_GAIN_TIME_CONSTANT = 0.03;

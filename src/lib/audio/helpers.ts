import {getContext, setContext} from 'svelte';
import {writable, type Writable} from 'svelte/store';

/**
 * Convert a user-facing volume value [0,1] to the actual gain value.
 * We want some sort of nonlinear curve to match user expectations.
 * TODO why is this exponent so different from the article? this sounds better to me
 * https://www.dr-lex.be/info-stuff/volumecontrols.html
 */
export const VOLUME_TO_GAIN_EXPONENT = 2.2;
export const volume_to_gain = (volume: number): number => {
	return volume ** VOLUME_TO_GAIN_EXPONENT;
};

export const SMOOTH_GAIN_TIME_CONSTANT = 0.03;

export type Frequency = number;

export const DEFAULT_VOLUME = 0.51;

const KEY = Symbol('volume');
export const get_volume = (): Writable<number> => getContext(KEY);
export const set_volume = (store = writable(DEFAULT_VOLUME)): Writable<number> =>
	setContext(KEY, store);

import {setContext, getContext} from 'svelte';
import {noop} from '@ryanatkn/belt/function.js';
import {BROWSER} from 'esm-env';

import {noop_ssr} from './util.js';

// There's an unfortunate overlap between "context" as in
// svelte's `getContext`/`setContext`, and the browser's `AudioContext`.
// The "ctx" abbreviation refers to `AudioContext`,
// and the fully spelled out "context" refers to usage with Svelte.

const KEY = Symbol('audio_context');

export type Get_Audio_Context = () => AudioContext;

/**
 * Components can do `const ac = get_audio_context();` and then use it with `ac()`.
 */
export const get_audio_context = (): Get_Audio_Context => getContext(KEY);

/**
 * Puts a lazy getter for `AudioContext` into the component's context.
 */
export const set_audio_context = (): Get_Audio_Context => {
	let ac: AudioContext | undefined;
	const get_audio_context: Get_Audio_Context = () => (ac ??= create_audio_context());
	return setContext(KEY, get_audio_context);
};

/**
 * This should be called during a user input action like a click,
 * or it needs `resume` called for some browsers.
 */
export const create_audio_context = (): AudioContext => {
	if (!BROWSER) return new Audio_Context_Stub() as any;
	const ac = new AudioContext();
	return ac;
};

// TODO maybe this isn't the best way to do this
class Audio_Context_Stub {
	baseLatency = 0;
	outputLatency = 0;
	resume = noop;
	suspend = noop;
	close = noop;
	createMediaElementSource = noop_ssr;
	createMediaStreamDestination = noop_ssr;
	createMediaStreamSource = noop_ssr;
	createMediaStreamTrackSource = noop_ssr;
	getOutputTimestamp = noop_ssr;
}

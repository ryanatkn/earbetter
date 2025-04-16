import {create_context} from '@ryanatkn/fuz/context_helpers.js';
import {noop} from '@ryanatkn/belt/function.js';
import {BROWSER} from 'esm-env';

import {noop_ssr} from '$lib/util.js';

export type Get_Audio_Context = () => AudioContext;

/**
 * Puts a lazy getter for `AudioContext` into the component's context.
 * Components can do `const ac = audio_context_context.get();` and then use it with `ac()`.
 */
export const audio_context_context = create_context((): Get_Audio_Context => {
	let ac: AudioContext | undefined;
	return () => (ac ??= create_audio_context());
});

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

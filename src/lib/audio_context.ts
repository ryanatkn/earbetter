import { create_context } from '@fuzdev/fuz_ui/context_helpers.ts';
import { noop } from '@fuzdev/fuz_util/function.ts';
import { BROWSER } from 'esm-env';

import { noop_ssr } from './util.ts';

export type GetAudioContext = () => AudioContext;

/**
 * Puts a lazy getter for `AudioContext` into the component's context.
 * Components can do `const ac = audio_context_context.get();` and then use it with `ac()`.
 */
export const audio_context_context = create_context((): GetAudioContext => {
	let ac: AudioContext | undefined;
	return () => (ac ??= create_audio_context());
});

/**
 * This should be called during a user input action like a click,
 * or it needs `resume` called for some browsers.
 */
export const create_audio_context = (): AudioContext => {
	if (!BROWSER) return new AudioContextStub() as any;
	const ac = new AudioContext();
	return ac;
};

// TODO maybe this isn't the best way to do this
class AudioContextStub {
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

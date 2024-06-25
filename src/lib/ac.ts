import {browser} from '$app/environment';
import {setContext, getContext} from 'svelte';
import {noop} from '@ryanatkn/belt/function.js';

// There's an unfortunate overlap between "context" as in
// svelte's `getContext`/`setContext`, and the browser's `AudioContext`.
// The "ctx" abbreviation refers to `AudioContext`,
// and the fully spelled out "context" refers to usage with Svelte.

const KEY = Symbol('ac');

// Components can do `const ac = get_ac();`.
export const get_ac = (): AudioContext => getContext<() => AudioContext>(KEY)();

// Puts a lazy getter for `AudioContext` into the component's context.
export const set_ac = (): (() => AudioContext) => {
	let ac: AudioContext | undefined;
	const get_ac = (): AudioContext => {
		if (!ac) ac = create_ac();
		return ac;
	};
	setContext(KEY, get_ac);
	return get_ac;
};

// TODO BLOCK @multiple where's the best place for this? needs to be synchronous with a click or similar - maybe `onclickcapture` on the main layout, and set context at that point
// await ac.resume();
/**
 * This should be called during a user input action like a click,
 * or it needs `resume` called for some browsers.
 */
export const create_ac = (): AudioContext => {
	if (!browser) return new Audio_Context_Stub() as any;
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

const noop_ssr = () => {
	throw new Error('Cannot call this method outside of the browser');
};

import {setContext, getContext} from 'svelte';

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

// This should be called during a user input action like a click,
// or it needs `resume` called for some browsers.
export const create_ac = (): AudioContext => {
	const w: any = window;
	const ac = new (w.AudioContext || w.webkitAudioContext)();
	return ac;
};

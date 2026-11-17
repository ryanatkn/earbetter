import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';

/**
 * A reactive view of the connected inputs of a `MIDIAccess`.
 * Reading `current` in an effect listens for `statechange` while anything observes it,
 * so devices plugged in or removed mid-session show up.
 */
export class MidiInputs {
	readonly access: MIDIAccess;
	readonly #subscribe: () => void;

	constructor(access: MIDIAccess) {
		this.access = access;
		this.#subscribe = createSubscriber((update) => on(access, 'statechange', update));
	}

	/**
	 * The connected inputs, a new array after each `statechange`.
	 */
	get current(): Array<MIDIInput> {
		this.#subscribe();
		return Array.from(this.access.inputs.values()).filter((i) => i.state === 'connected');
	}
}

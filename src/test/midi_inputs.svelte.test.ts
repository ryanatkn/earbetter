import { test, assert } from 'vitest';
import { flushSync } from 'svelte';

import { MidiInputs } from '#lib/midi_inputs.svelte.ts';

interface FakeAccess {
	access: MIDIAccess;
	inputs: Map<string, MIDIInput>;
	set_state: (id: string, state: MIDIPortDeviceState) => void;
	count_listeners: () => number;
}

const create_access = (): FakeAccess => {
	const target = new EventTarget();
	const inputs: Map<string, MIDIInput> = new Map();
	let listeners = 0;
	const access = Object.assign(target, {
		inputs,
		addEventListener: (...args: Parameters<EventTarget['addEventListener']>) => {
			listeners++;
			EventTarget.prototype.addEventListener.apply(target, args);
		},
		removeEventListener: (...args: Parameters<EventTarget['removeEventListener']>) => {
			listeners--;
			EventTarget.prototype.removeEventListener.apply(target, args);
		}
	}) as unknown as MIDIAccess;
	const set_state = (id: string, state: MIDIPortDeviceState): void => {
		inputs.set(id, { id, name: id, type: 'input', state } as MIDIInput);
		target.dispatchEvent(new Event('statechange'));
	};
	return { access, inputs, set_state, count_listeners: () => listeners };
};

test('lists only connected inputs', () => {
	const { access, set_state } = create_access();
	set_state('a', 'connected');
	set_state('b', 'disconnected');
	assert.deepEqual(
		new MidiInputs(access).current.map((i) => i.id),
		['a']
	);
});

test('updates observers on statechange and listens only while observed', () => {
	const { access, set_state, count_listeners } = create_access();
	const midi_inputs = new MidiInputs(access);
	const seen: Array<Array<string>> = [];
	assert.strictEqual(count_listeners(), 0);
	const destroy = $effect.root(() => {
		$effect(() => {
			seen.push(midi_inputs.current.map((i) => i.id));
		});
	});
	flushSync();
	assert.strictEqual(count_listeners(), 1);
	set_state('a', 'connected');
	flushSync();
	set_state('a', 'disconnected');
	flushSync();
	assert.deepEqual(seen, [[], ['a'], []]);
	destroy();
	flushSync();
	assert.strictEqual(count_listeners(), 0);
});

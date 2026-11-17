import { test, assert, vi, beforeEach } from 'vitest';

import { request_access, reset_midi_access } from '#lib/midi_access.ts';
import { assert_rejects } from './test_helpers.ts';

const create_state = (): { midi_access: MIDIAccess | null } => ({ midi_access: null });
const create_access = (): MIDIAccess => ({ inputs: new Map() }) as unknown as MIDIAccess;

beforeEach(() => {
	reset_midi_access(create_state()); // the pending request is module state
});

test('stores the granted access', async () => {
	const state = create_state();
	const access = create_access();
	assert.strictEqual(await request_access(state, () => Promise.resolve(access)), access);
	assert.strictEqual(state.midi_access, access);
});

test('returns existing access without requesting', async () => {
	const access = create_access();
	const request = vi.fn(() => Promise.resolve(create_access()));
	assert.strictEqual(await request_access({ midi_access: access }, request), access);
	assert.strictEqual(request.mock.calls.length, 0);
});

test('shares one pending request between callers', async () => {
	const state = create_state();
	const access = create_access();
	const request = vi.fn(() => Promise.resolve(access));
	const [a, b] = await Promise.all([
		request_access(state, request),
		request_access(state, request)
	]);
	assert.strictEqual(a, access);
	assert.strictEqual(b, access);
	assert.strictEqual(request.mock.calls.length, 1);
});

// regression: a failure was cached, so every later request rejected without retrying
test('a failed request rejects and the next call retries', async () => {
	const state = create_state();
	await assert_rejects(
		() => request_access(state, () => Promise.reject(new Error('denied'))),
		/denied/
	);
	const access = create_access();
	assert.strictEqual(await request_access(state, () => Promise.resolve(access)), access);
	assert.strictEqual(state.midi_access, access);
});

test('a reset discards a request still pending', async () => {
	const state = create_state();
	let resolve_first!: (access: MIDIAccess) => void;
	const first = request_access(state, () => new Promise((r) => (resolve_first = r)));
	reset_midi_access(state);
	const second_access = create_access();
	const second = request_access(state, () => Promise.resolve(second_access));
	resolve_first(create_access());
	assert.strictEqual(await first, second_access);
	assert.strictEqual(await second, second_access);
	assert.strictEqual(state.midi_access, second_access);
});

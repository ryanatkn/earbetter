import { describe, test, assert, vi, afterEach } from 'vitest';

import { parse_midi_message, request_midi_access } from '#lib/midi_helpers.ts';
import { assert_rejects } from './test_helpers.ts';

const to_event = (...data: Array<number>): MIDIMessageEvent =>
	({ data: new Uint8Array(data) }) as unknown as MIDIMessageEvent;

const cases: Array<
	[
		label: string,
		data: Array<number>,
		command: number,
		channel: number,
		note: number,
		velocity: number
	]
> = [
	['note on, channel 1', [0x90, 60, 127], 9, 0, 60, 1],
	['note on, channel 16', [0x9f, 72, 0], 9, 15, 72, 0],
	['note off', [0x80, 48, 64], 8, 0, 48, 64 / 127],
	['control change', [0xb3, 7, 100], 11, 3, 7, 100 / 127]
];
test('parse_midi_message ignores a message without data', () => {
	assert.strictEqual(parse_midi_message({ data: null } as unknown as MIDIMessageEvent), null);
});

test.each(cases)('parse_midi_message %s', (_label, data, command, channel, note, velocity) => {
	assert.deepEqual(parse_midi_message(to_event(...data)), { command, channel, note, velocity });
});

describe('request_midi_access', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('throws when the browser lacks WebMIDI', async () => {
		vi.stubGlobal('navigator', {});
		await assert_rejects(() => request_midi_access(), /not supported/);
	});

	test('requests with the given options', async () => {
		const access = {} as MIDIAccess;
		const requestMIDIAccess = vi.fn(() => Promise.resolve(access));
		vi.stubGlobal('navigator', { requestMIDIAccess });
		assert.strictEqual(await request_midi_access({ sysex: true }), access);
		assert.deepEqual(requestMIDIAccess.mock.calls, [[{ sysex: true }]] as Array<Array<unknown>>);
	});
});

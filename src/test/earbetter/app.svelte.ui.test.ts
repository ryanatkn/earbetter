import { test, assert, vi, beforeEach, afterEach } from 'vitest';

import { create_fake_audio_context, create_memory_storage } from '../test_helpers.ts';
import { create_app } from './app_test_helpers.ts';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
});
afterEach(() => {
	vi.unstubAllGlobals();
});

test('start_note holds a note until stop_note', () => {
	const audio = create_fake_audio_context();
	const app = create_app(audio);
	app.start_note(60);
	assert.deepEqual(audio.played, [60]);
	assert.ok(app.playing_notes.has(60));
	app.stop_note(60);
	assert.ok(!app.playing_notes.has(60));
});

test('start_note plays each note at most once while held', () => {
	const audio = create_fake_audio_context();
	const app = create_app(audio);
	app.start_note(60);
	app.start_note(60, 1);
	app.start_note(64);
	assert.deepEqual(audio.played, [60, 64]);
	app.stop_note(60);
	app.start_note(60);
	assert.deepEqual(audio.played, [60, 64, 60]);
});

test('stop_note ignores a note that is not held', () => {
	const app = create_app();
	app.stop_note(60);
	assert.strictEqual(app.playing_notes.size, 0);
});

test('each app holds its own notes', () => {
	const first = create_app();
	const second = create_app();
	first.start_note(60);
	second.stop_note(60);
	assert.ok(first.playing_notes.has(60));
});

test('register_form tracks the mounted form until it unmounts', () => {
	const app = create_app();
	const first = {} as HTMLFormElement;
	const second = {} as HTMLFormElement;
	const cleanup_first = app.register_form('level')(first);
	assert.strictEqual(app.form_els.level, first);
	const cleanup_second = app.register_form('level')(second);
	cleanup_first?.(); // a stale cleanup leaves the newer form registered
	assert.strictEqual(app.form_els.level, second);
	cleanup_second?.();
	assert.strictEqual(app.form_els.level, null);
	assert.strictEqual(app.form_els.realm, null);
});

import * as s from '@fuzdev/fuz_schema/schema.ts';
import { test, assert, vi, beforeEach, afterEach } from 'vitest';
import { goto } from '$app/navigation';

import { LevelData, to_level_url } from '#lib/earbetter/level.svelte.ts';
import type { App } from '#lib/earbetter/app.svelte.ts';
import { create_memory_storage } from '../test_helpers.ts';
import { create_app } from './app_test_helpers.ts';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

let app: App;

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
	app = create_app();
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.mocked(goto).mockClear();
});

test('no level without active level data', () => {
	assert.strictEqual(app.level, null);
});

test('active level data creates a level', () => {
	const data = s.parse_or_throw(LevelData, {});
	app.set_active_level_data(data);
	const { level } = app;
	assert.ok(level);
	assert.strictEqual(level.level_data, data);
	assert.strictEqual(level.status, 'initial');
});

test('the same active level data keeps the level', () => {
	const data = s.parse_or_throw(LevelData, {});
	app.set_active_level_data(data);
	const { level } = app;
	app.set_active_level_data(data);
	assert.strictEqual(app.level, level);
});

test('replacing the active level disposes the previous one', () => {
	app.set_active_level_data(s.parse_or_throw(LevelData, {}));
	const previous = app.level!;
	const seq_id = previous.seq_id;
	app.set_active_level_data(null);
	assert.strictEqual(app.level, null);
	assert.ok(previous.seq_id > seq_id);
});

test('a completed level records stats on the selected project', () => {
	const data = app.levels![0]!;
	app.set_active_level_data(data);
	app.level!.start();
	app.level!.win();
	assert.deepEqual(app.selected_project_data!.level_stats.mistakes[data.id]!, [0]);
	app.set_active_level_data(null);
});

test('play_level navigates to the level and keeps it as the draft', async () => {
	const level = app.levels![1]!;
	await app.play_level(level.id);
	assert.deepEqual(vi.mocked(goto).mock.calls, [[to_level_url(level)]]);
	assert.strictEqual(app.draft_level_data, level);
});

test('play_level ignores an unknown level', async () => {
	await app.play_level('unknown');
	assert.strictEqual(vi.mocked(goto).mock.calls.length, 0);
});

test('exit_level navigates to the trainer', async () => {
	await app.exit_level();
	const [[url]] = vi.mocked(goto).mock.calls as [[string]];
	assert.ok(url.endsWith('/trainer'));
});

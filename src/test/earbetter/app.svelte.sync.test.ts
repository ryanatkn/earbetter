import * as s from '@fuzdev/fuz_schema/schema.ts';
import { test, assert, vi, beforeEach, afterEach } from 'vitest';

import { ProjectData } from '#lib/earbetter/project.ts';
import { create_memory_storage } from '../test_helpers.ts';
import {
	create_app,
	read_stored,
	TEST_SITE_STORAGE_KEY,
	TEST_STORAGE_KEY
} from './app_test_helpers.ts';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
});
afterEach(() => {
	vi.unstubAllGlobals();
});

test('applies site settings from another tab without writing back', () => {
	const app = create_app();
	app.volume = 0.5;
	const stored = read_stored(TEST_SITE_STORAGE_KEY);
	app.receive_storage(TEST_SITE_STORAGE_KEY, JSON.stringify({ ...stored, volume: 0.1 }));
	assert.strictEqual(app.volume, 0.1);
	assert.strictEqual(read_stored(TEST_SITE_STORAGE_KEY).volume, 0.5);
});

test('keeps its own selection when app data arrives from another tab', () => {
	const app = create_app();
	const realm = app.realms![1]!;
	app.select_realm(realm.id);
	const project_id = app.selected_project_id;
	app.receive_storage(
		TEST_STORAGE_KEY,
		JSON.stringify({
			...app.app_data,
			show_trainer_help: false,
			selected_project_id: null,
			selected_realm_id: null
		})
	);
	assert.strictEqual(app.show_trainer_help, false);
	assert.strictEqual(app.selected_project_id, project_id);
	assert.strictEqual(app.selected_realm_id, realm.id);
});

test('updates a loaded project edited in another tab', () => {
	const app = create_app();
	const project = app.project_datas[0]!;
	app.receive_storage(project.id, JSON.stringify({ ...project, name: 'renamed' }));
	assert.strictEqual(app.selected_project_data?.name, 'renamed');
});

test('drops a loaded project removed in another tab and reselects', () => {
	const app = create_app();
	const other = s.parse_or_throw(ProjectData, { name: 'other' });
	app.create_project(other);
	app.receive_storage(other.id, null);
	assert.ok(!app.project_datas.some((p) => p.id === other.id));
	assert.strictEqual(app.selected_project_id, app.project_datas[0]!.id);
});

test('ignores unloaded projects, cleared storage, and invalid values', () => {
	const app = create_app();
	const before = app.project_datas;
	const site_data = app.site_data;
	app.receive_storage('unknown_project', JSON.stringify({}));
	app.receive_storage(null, null);
	app.receive_storage(TEST_SITE_STORAGE_KEY, '{not json');
	app.receive_storage(TEST_SITE_STORAGE_KEY, JSON.stringify({ volume: 'loud' }));
	assert.strictEqual(app.project_datas, before);
	assert.strictEqual(app.site_data, site_data);
});

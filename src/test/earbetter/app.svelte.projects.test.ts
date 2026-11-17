import * as s from '@fuzdev/fuz_schema/schema.ts';
import { describe, test, assert, vi, beforeEach, afterEach } from 'vitest';

import { AppData } from '#lib/earbetter/app.svelte.ts';
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

describe('a fresh app', () => {
	test('creates and selects the default project', () => {
		const app = create_app();
		assert.strictEqual(app.project_datas.length, 1);
		const project = app.project_datas[0]!;
		assert.strictEqual(app.selected_project_id, project.id);
		assert.strictEqual(app.selected_realm_id, project.realms[0]!.id);
		assert.deepEqual(app.app_data.projects, [{ id: project.id, name: project.name }]);
		assert.deepEqual(read_stored(project.id), project);
	});

	// regression: the created project was loaded back from storage and added a second time
	test('holds each project once', () => {
		const app = create_app();
		assert.strictEqual(new Set(app.project_datas.map((p) => p.id)).size, app.project_datas.length);
	});

	test('syncs the selection into the app data', () => {
		const app = create_app();
		assert.strictEqual(app.app_data.selected_project_id, app.selected_project_id);
		assert.strictEqual(app.app_data.selected_realm_id, app.selected_realm_id);
		const realm = app.realms![2]!;
		app.select_realm(realm.id);
		assert.strictEqual(app.app_data.selected_realm_id, realm.id);
	});

	test('loads the stored site data', () => {
		localStorage.setItem(
			TEST_SITE_STORAGE_KEY,
			JSON.stringify({
				volume: 0.2,
				instrument: 'square',
				scale: { name: 'major', notes: [2, 4, 5, 7, 9, 11] },
				key: 'D'
			})
		);
		const app = create_app();
		assert.strictEqual(app.volume, 0.2);
		assert.strictEqual(app.instrument, 'square');
		assert.strictEqual(app.key, 'D');
		const notes = app.enabled_notes;
		assert.ok(notes);
		assert.ok(notes.has(62));
		assert.ok(!notes.has(60));
	});

	test('enables every note for the chromatic scale', () => {
		const app = create_app();
		assert.strictEqual(app.scale.name, 'chromatic');
		assert.strictEqual(app.enabled_notes, null);
	});

	test('toggles the trainer help', () => {
		const app = create_app();
		assert.strictEqual(app.show_trainer_help, true);
		app.toggle_trainer_help();
		assert.strictEqual(app.show_trainer_help, false);
		assert.strictEqual(app.app_data.show_trainer_help, false);
	});
});

describe('persistence', () => {
	test('saves the site settings on write', () => {
		const app = create_app();
		assert.strictEqual(read_stored(TEST_SITE_STORAGE_KEY), null); // loading doesn't write
		app.volume = 0.3;
		app.instrument = 'triangle';
		app.key = 'E';
		const stored = read_stored(TEST_SITE_STORAGE_KEY);
		assert.strictEqual(stored.volume, 0.3);
		assert.strictEqual(stored.instrument, 'triangle');
		assert.strictEqual(stored.key, 'E');
		assert.strictEqual(create_app().volume, 0.3);
	});

	test('restores the projects and selection', () => {
		const first = create_app();
		const realm = first.realms![1]!;
		first.select_realm(realm.id);

		const app = create_app();
		assert.strictEqual(app.selected_project_id, first.selected_project_id);
		assert.strictEqual(app.selected_realm_id, realm.id);
		assert.deepEqual(app.project_datas, first.project_datas);
	});

	test('drops projects whose data is missing', () => {
		const project = s.parse_or_throw(ProjectData, {});
		localStorage.setItem(project.id, JSON.stringify(project));
		localStorage.setItem(
			TEST_STORAGE_KEY,
			JSON.stringify(
				s.parse_or_throw(AppData, {
					projects: [
						{ id: 'missing', name: 'gone' },
						{ id: project.id, name: project.name }
					],
					selected_project_id: project.id
				})
			)
		);
		const app = create_app();
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[project.id]
		);
		assert.strictEqual(app.selected_project_id, project.id);
	});

	// regression: the unparseable project stayed listed after being replaced
	test('replaces a corrupt selected project', () => {
		localStorage.setItem('corrupt', '{"realms": "not an array"}');
		localStorage.setItem(
			TEST_STORAGE_KEY,
			JSON.stringify(
				s.parse_or_throw(AppData, {
					projects: [{ id: 'corrupt', name: 'c' }],
					selected_project_id: 'corrupt'
				})
			)
		);
		const app = create_app();
		assert.notStrictEqual(app.selected_project_id, 'corrupt');
		assert.ok(app.selected_project_data);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[app.selected_project_data.id]
		);
		assert.strictEqual(localStorage.getItem('corrupt'), null);
	});

	test('resets corrupt app data', () => {
		localStorage.setItem(TEST_STORAGE_KEY, '{"projects": 5}');
		const app = create_app();
		assert.strictEqual(app.project_datas.length, 1);
	});
});

describe('projects', () => {
	test('create_project adds, selects, and persists', () => {
		const app = create_app();
		const project = s.parse_or_throw(ProjectData, { name: 'new' });
		assert.strictEqual(app.create_project(project), project);
		assert.strictEqual(app.selected_project_id, project.id);
		assert.deepEqual(app.app_data.projects.at(-1), { id: project.id, name: 'new' });
		assert.deepEqual(read_stored(project.id), project);
	});

	test('create_project returns an existing project with the same id', () => {
		const app = create_app();
		const existing = app.project_datas[0]!;
		assert.strictEqual(app.create_project({ ...existing, name: 'other' }), existing);
		assert.strictEqual(app.project_datas.length, 1);
	});

	test('select_project loads a stored project', () => {
		const first = create_app();
		const other = s.parse_or_throw(ProjectData, { name: 'other' });
		first.create_project(other);
		const original = first.project_datas[0]!;
		first.select_project(original.id);

		const app = create_app();
		assert.strictEqual(app.project_datas.length, 1);
		app.select_project(other.id);
		assert.strictEqual(app.project_datas.length, 2);
		assert.strictEqual(app.selected_project_data?.name, 'other');
		assert.strictEqual(app.selected_realm_id, null);
	});

	test('select_project with null clears the selection', () => {
		const app = create_app();
		app.select_project(null);
		assert.strictEqual(app.selected_project_data, null);
		assert.strictEqual(app.realms, null);
	});

	test('update_project renames in the app data and persists', () => {
		const app = create_app();
		const project = app.project_datas[0]!;
		app.update_project({ ...project, name: 'renamed' });
		assert.strictEqual(app.selected_project_data?.name, 'renamed');
		assert.deepEqual(app.app_data.projects, [{ id: project.id, name: 'renamed' }]);
		assert.strictEqual(read_stored(project.id).name, 'renamed');
	});

	test('update_project ignores an unknown project', () => {
		const app = create_app();
		const before = app.project_datas;
		app.update_project(s.parse_or_throw(ProjectData, {}));
		assert.strictEqual(app.project_datas, before);
	});

	test('duplicate_project copies with a new id and name', () => {
		const app = create_app();
		const project = app.project_datas[0]!;
		app.duplicate_project(project.id);
		const copy = app.project_datas[1]!;
		assert.notStrictEqual(copy.id, project.id);
		assert.strictEqual(copy.name, project.name + '_');
		assert.deepEqual(copy.realms, project.realms);
		assert.strictEqual(app.selected_project_id, copy.id);
		assert.strictEqual(app.editing_project_data, copy);
	});

	test('remove_project selects another project and deletes the stored data', () => {
		const app = create_app();
		const first = app.project_datas[0]!;
		const second = app.create_project(s.parse_or_throw(ProjectData, {}));
		app.remove_project(second.id);
		assert.strictEqual(app.selected_project_id, first.id);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[first.id]
		);
		assert.strictEqual(localStorage.getItem(second.id), null);
	});

	test('removing the last project creates a new one', () => {
		const app = create_app();
		const only = app.project_datas[0]!;
		app.remove_project(only.id);
		assert.strictEqual(app.project_datas.length, 1);
		assert.notStrictEqual(app.selected_project_id, only.id);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[app.selected_project_data?.id]
		);
	});

	test('edit_project distinguishes drafts from existing projects', () => {
		const app = create_app();
		const project = app.project_datas[0]!;
		app.edit_project(project);
		assert.strictEqual(app.editing_project, true);
		assert.strictEqual(app.editing_project_draft, false);
		assert.strictEqual(app.editing_project_data, project);

		const draft = s.parse_or_throw(ProjectData, {});
		app.edit_project(draft);
		assert.strictEqual(app.editing_project_draft, true);
		assert.strictEqual(app.editing_project_data, draft);

		app.edit_project(null);
		assert.strictEqual(app.editing_project, false);
		assert.strictEqual(app.draft_project_data, null);
	});
});

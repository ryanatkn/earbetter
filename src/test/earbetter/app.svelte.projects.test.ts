import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {flushSync} from 'svelte';

import {App_Data} from '$lib/earbetter/app.svelte.js';
import {Project_Data} from '$lib/earbetter/project.js';
import {create_memory_storage} from '../test_helpers.js';
import {
	create_app,
	read_stored,
	TEST_STORAGE_KEY,
	type App_Harness,
} from './app_test_helpers.svelte.js';

vi.mock('$app/navigation', () => ({goto: vi.fn()}));

let harnesses: Array<App_Harness> = [];
const create = (...args: Parameters<typeof create_app>): App_Harness => {
	const harness = create_app(...args);
	harnesses.push(harness);
	return harness;
};

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
});
afterEach(() => {
	for (const h of harnesses) h.destroy();
	harnesses = [];
	vi.unstubAllGlobals();
});

/**
 * Persists app data the way the root layout does.
 */
const save = ({app}: App_Harness): void => {
	app.save(app.toJSON());
};

describe('a fresh app', () => {
	test('creates and selects the default project', () => {
		const {app} = create();
		assert.strictEqual(app.project_datas.length, 1);
		const [project] = app.project_datas;
		assert.strictEqual(app.selected_project_id, project.id);
		assert.strictEqual(app.selected_realm_id, project.realms[0].id);
		assert.deepEqual(app.app_data.projects, [{id: project.id, name: project.name}]);
		assert.deepEqual(read_stored(project.id), project);
	});

	// regression: the created project was loaded back from storage and added a second time
	test('holds each project once', () => {
		const {app} = create();
		assert.strictEqual(new Set(app.project_datas.map((p) => p.id)).size, app.project_datas.length);
	});

	test('syncs the selection into the app data', () => {
		const {app} = create();
		assert.strictEqual(app.app_data.selected_project_id, app.selected_project_id);
		assert.strictEqual(app.app_data.selected_realm_id, app.selected_realm_id);
		const realm = app.realms![2];
		app.select_realm(realm.id);
		flushSync();
		assert.strictEqual(app.app_data.selected_realm_id, realm.id);
	});

	test('applies the initial site data', () => {
		const {app} = create({
			volume: 0.2,
			instrument: 'square',
			scale: {name: 'major', notes: [2, 4, 5, 7, 9, 11]},
			key: 'D',
		});
		assert.strictEqual(app.volume, 0.2);
		assert.strictEqual(app.instrument, 'square');
		assert.strictEqual(app.key, 'D');
		const notes = app.enabled_notes;
		assert.ok(notes);
		assert.ok(notes.has(62));
		assert.ok(!notes.has(60));
	});

	test('enables every note for the chromatic scale', () => {
		const {app} = create();
		assert.strictEqual(app.scale.name, 'chromatic');
		assert.strictEqual(app.enabled_notes, null);
	});

	test('toggles the trainer help', () => {
		const {app} = create();
		assert.strictEqual(app.show_trainer_help, true);
		app.toggle_trainer_help();
		assert.strictEqual(app.show_trainer_help, false);
		assert.strictEqual(app.app_data.show_trainer_help, false);
	});
});

describe('persistence', () => {
	test('restores the projects and selection', () => {
		const first = create();
		const realm = first.app.realms![1];
		first.app.select_realm(realm.id);
		flushSync();
		save(first);

		const {app} = create();
		assert.strictEqual(app.selected_project_id, first.app.selected_project_id);
		assert.strictEqual(app.selected_realm_id, realm.id);
		assert.deepEqual(app.project_datas, first.app.project_datas);
	});

	test('drops projects whose data is missing', () => {
		const project = Project_Data.parse({});
		localStorage.setItem(project.id, JSON.stringify(project));
		localStorage.setItem(
			TEST_STORAGE_KEY,
			JSON.stringify(
				App_Data.parse({
					projects: [
						{id: 'missing', name: 'gone'},
						{id: project.id, name: project.name},
					],
					selected_project_id: project.id,
				}),
			),
		);
		const {app} = create();
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[project.id],
		);
		assert.strictEqual(app.selected_project_id, project.id);
	});

	// regression: the unparseable project stayed listed after being replaced
	test('replaces a corrupt selected project', () => {
		localStorage.setItem('corrupt', '{"realms": "not an array"}');
		localStorage.setItem(
			TEST_STORAGE_KEY,
			JSON.stringify(
				App_Data.parse({
					projects: [{id: 'corrupt', name: 'c'}],
					selected_project_id: 'corrupt',
				}),
			),
		);
		const {app} = create();
		assert.notStrictEqual(app.selected_project_id, 'corrupt');
		assert.ok(app.selected_project_data);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[app.selected_project_data.id],
		);
		assert.strictEqual(localStorage.getItem('corrupt'), null);
	});

	test('resets corrupt app data', () => {
		localStorage.setItem(TEST_STORAGE_KEY, '{"projects": 5}');
		const {app} = create();
		assert.strictEqual(app.project_datas.length, 1);
	});
});

describe('projects', () => {
	test('create_project adds, selects, and persists', () => {
		const {app} = create();
		const project = Project_Data.parse({name: 'new'});
		assert.strictEqual(app.create_project(project), project);
		assert.strictEqual(app.selected_project_id, project.id);
		assert.deepEqual(app.app_data.projects.at(-1), {id: project.id, name: 'new'});
		assert.deepEqual(read_stored(project.id), project);
	});

	test('create_project returns an existing project with the same id', () => {
		const {app} = create();
		const [existing] = app.project_datas;
		assert.strictEqual(app.create_project({...existing, name: 'other'}), existing);
		assert.strictEqual(app.project_datas.length, 1);
	});

	test('select_project loads a stored project', () => {
		const first = create();
		const other = Project_Data.parse({name: 'other'});
		first.app.create_project(other);
		const [original] = first.app.project_datas;
		first.app.select_project(original.id);
		flushSync();
		save(first);

		const {app} = create();
		assert.strictEqual(app.project_datas.length, 1);
		app.select_project(other.id);
		assert.strictEqual(app.project_datas.length, 2);
		assert.strictEqual(app.selected_project_data?.name, 'other');
		assert.strictEqual(app.selected_realm_id, null);
	});

	test('select_project with null clears the selection', () => {
		const {app} = create();
		app.select_project(null);
		assert.strictEqual(app.selected_project_data, null);
		assert.strictEqual(app.realms, null);
	});

	test('update_project renames in the app data and persists', () => {
		const {app} = create();
		const [project] = app.project_datas;
		app.update_project({...project, name: 'renamed'});
		assert.strictEqual(app.selected_project_data?.name, 'renamed');
		assert.deepEqual(app.app_data.projects, [{id: project.id, name: 'renamed'}]);
		assert.strictEqual(read_stored(project.id).name, 'renamed');
	});

	test('update_project ignores an unknown project', () => {
		const {app} = create();
		const before = app.project_datas;
		app.update_project(Project_Data.parse({}));
		assert.strictEqual(app.project_datas, before);
	});

	test('duplicate_project copies with a new id and name', () => {
		const {app} = create();
		const [project] = app.project_datas;
		app.duplicate_project(project.id);
		const copy = app.project_datas[1];
		assert.notStrictEqual(copy.id, project.id);
		assert.strictEqual(copy.name, project.name + '_');
		assert.deepEqual(copy.realms, project.realms);
		assert.strictEqual(app.selected_project_id, copy.id);
		assert.strictEqual(app.editing_project_data, copy);
	});

	test('remove_project selects another project and deletes the stored data', () => {
		const {app} = create();
		const [first] = app.project_datas;
		const second = app.create_project(Project_Data.parse({}));
		app.remove_project(second.id);
		assert.strictEqual(app.selected_project_id, first.id);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[first.id],
		);
		assert.strictEqual(localStorage.getItem(second.id), null);
	});

	test('removing the last project creates a new one', () => {
		const {app} = create();
		const [only] = app.project_datas;
		app.remove_project(only.id);
		assert.strictEqual(app.project_datas.length, 1);
		assert.notStrictEqual(app.selected_project_id, only.id);
		assert.deepEqual(
			app.app_data.projects.map((p) => p.id),
			[app.selected_project_data?.id],
		);
	});

	test('edit_project distinguishes drafts from existing projects', () => {
		const {app} = create();
		const [project] = app.project_datas;
		app.edit_project(project);
		assert.strictEqual(app.editing_project, true);
		assert.strictEqual(app.editing_project_draft, false);
		assert.strictEqual(app.editing_project_data, project);

		const draft = Project_Data.parse({});
		app.edit_project(draft);
		assert.strictEqual(app.editing_project_draft, true);
		assert.strictEqual(app.editing_project_data, draft);

		app.edit_project(null);
		assert.strictEqual(app.editing_project, false);
		assert.strictEqual(app.draft_project_data, null);
	});
});

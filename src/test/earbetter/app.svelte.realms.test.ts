import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';

import {RealmData} from '$lib/earbetter/realm.js';
import {LevelData} from '$lib/earbetter/level.svelte.js';
import {create_memory_storage} from '../test_helpers.js';
import {create_app, read_stored, type AppHarness} from './app_test_helpers.svelte.js';

vi.mock('$app/navigation', () => ({goto: vi.fn()}));

let harness: AppHarness;

beforeEach(() => {
	vi.stubGlobal('localStorage', create_memory_storage());
	harness = create_app();
});
afterEach(() => {
	harness.destroy();
	vi.unstubAllGlobals();
});

const all_level_ids = (): Array<string> =>
	harness.app.realms!.flatMap((r) => r.levels.map((l) => l.id));

describe('realms', () => {
	test('create_realm appends, selects, and persists', () => {
		const {app} = harness;
		const realm = RealmData.parse({name: 'new'});
		app.create_realm(realm);
		assert.strictEqual(app.realms!.at(-1), realm);
		assert.strictEqual(app.selected_realm_id, realm.id);
		assert.strictEqual(read_stored(app.selected_project_id!).realms.at(-1).name, 'new');
	});

	test('create_realm can skip selecting', () => {
		const {app} = harness;
		const selected = app.selected_realm_id;
		app.create_realm(RealmData.parse({}), false);
		assert.strictEqual(app.selected_realm_id, selected);
	});

	test('create_realm ignores a duplicate id', () => {
		const {app} = harness;
		const count = app.realms!.length;
		app.create_realm(app.realms![0]);
		assert.strictEqual(app.realms!.length, count);
	});

	test('select_realm ignores an unknown id', () => {
		const {app} = harness;
		const selected = app.selected_realm_id;
		app.select_realm('unknown');
		assert.strictEqual(app.selected_realm_id, selected);
	});

	test('update_realm replaces in place', () => {
		const {app} = harness;
		const realm = app.realms![3];
		app.update_realm({...realm, name: 'renamed'});
		assert.strictEqual(app.realms![3].name, 'renamed');
		assert.strictEqual(app.selected_realm_id, realm.id);
	});

	test('remove_realm removes and clears the selection', () => {
		const {app} = harness;
		const realm = app.selected_realm_data!;
		const count = app.realms!.length;
		app.remove_realm(realm.id);
		assert.strictEqual(app.realms!.length, count - 1);
		assert.ok(!app.realms!.some((r) => r.id === realm.id));
		assert.strictEqual(app.selected_realm_id, null);
	});

	test('duplicate_realm copies with a new name and selects the copy', () => {
		const {app} = harness;
		const realm = app.realms![0];
		app.duplicate_realm(realm.id);
		const copy = app.realms!.at(-1)!;
		assert.notStrictEqual(copy.id, realm.id);
		assert.strictEqual(copy.name, realm.name + '_');
		assert.deepEqual(
			copy.levels.map((l) => l.name),
			realm.levels.map((l) => l.name),
		);
		assert.strictEqual(app.selected_realm_id, copy.id);
	});

	// regression: copied levels kept their ids, so lookups by id hit the original realm's levels
	test('duplicate_realm gives the copied levels new ids', () => {
		const {app} = harness;
		app.duplicate_realm(app.realms![0].id);
		const ids = all_level_ids();
		assert.strictEqual(new Set(ids).size, ids.length);
	});

	test('editing a duplicated realm leaves the original alone', () => {
		const {app} = harness;
		const original = app.realms![0];
		app.duplicate_realm(original.id);
		const copy = app.realms!.at(-1)!;
		app.update_level({...copy.levels[0], name: 'edited copy'});
		app.remove_level(copy.levels[1].id);
		app.register_success(copy.levels[2].id, 0);
		const original_after = app.realms![0];
		assert.deepEqual(original_after, original);
		assert.strictEqual(app.realms!.at(-1)!.levels[0].name, 'edited copy');
		assert.deepEqual(app.selected_project_data!.level_stats.mistakes, {
			[copy.levels[2].id]: [0],
		});
	});

	test('edit_realm distinguishes drafts from existing realms', () => {
		const {app} = harness;
		const realm = app.realms![1];
		app.edit_realm(realm);
		assert.strictEqual(app.editing_realm_draft, false);
		assert.strictEqual(app.selected_realm_id, realm.id);
		assert.strictEqual(app.editing_realm_data, realm);

		const draft = RealmData.parse({});
		app.edit_realm(draft);
		assert.strictEqual(app.editing_realm_draft, true);
		assert.strictEqual(app.editing_realm_data, draft);

		app.edit_realm(null);
		assert.strictEqual(app.editing_realm, false);
	});
});

describe('levels', () => {
	test('create_level appends to the selected realm', () => {
		const {app} = harness;
		const level = LevelData.parse({name: 'new'});
		app.edit_level(level);
		app.create_level(level);
		assert.strictEqual(app.levels!.at(-1), level);
		assert.strictEqual(app.editing_level, false);
		assert.strictEqual(app.draft_level_data, null);
	});

	test('create_level needs a selected realm', () => {
		const {app} = harness;
		app.select_realm(null);
		const count = all_level_ids().length;
		app.create_level(LevelData.parse({}));
		assert.strictEqual(all_level_ids().length, count);
	});

	test('create_level ignores a duplicate id', () => {
		const {app} = harness;
		const count = app.levels!.length;
		app.create_level(app.levels![0]);
		assert.strictEqual(app.levels!.length, count);
	});

	test('duplicate_level copies with a new id and name for editing', () => {
		const {app} = harness;
		const level = app.levels![0];
		app.duplicate_level(level.id);
		const copy = app.levels!.at(-1)!;
		assert.notStrictEqual(copy.id, level.id);
		assert.strictEqual(copy.name, level.name + '_');
		assert.deepEqual(copy.intervals, level.intervals);
		assert.strictEqual(app.editing_level, true);
		assert.strictEqual(app.draft_level_data, copy);
	});

	test('update_level replaces in place', () => {
		const {app} = harness;
		const level = app.levels![2];
		app.update_level({...level, trial_count: 9});
		assert.strictEqual(app.levels![2].trial_count, 9);
		assert.strictEqual(app.draft_level_data?.id, level.id);
	});

	test('update_level finds levels in unselected realms', () => {
		const {app} = harness;
		const level = app.realms![4].levels[0];
		app.update_level({...level, name: 'elsewhere'});
		assert.strictEqual(app.realms![4].levels[0].name, 'elsewhere');
	});

	test('remove_level removes and clears its draft', () => {
		const {app} = harness;
		const level = app.levels![1];
		app.edit_level(level);
		app.remove_level(level.id);
		assert.ok(!all_level_ids().includes(level.id));
		assert.strictEqual(app.draft_level_data, null);
	});

	test('register_success records stats on the selected project', () => {
		const {app} = harness;
		const id = app.levels![0].id;
		app.register_success(id, 2);
		app.register_success(id, 1);
		assert.deepEqual(app.selected_project_data!.level_stats.mistakes[id], [2, 1]);
		assert.deepEqual(read_stored(app.selected_project_id!).level_stats.mistakes[id], [2, 1]);
	});
});

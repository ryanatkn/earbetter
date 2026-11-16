import {test, assert} from 'vitest';

import {Project_Data, Project_Metadata} from '$lib/earbetter/project.js';
import {Realm_Data} from '$lib/earbetter/realm.js';
import {DEFAULT_INTERVALS, DEFAULT_LEVEL_STATS, Level_Data} from '$lib/earbetter/level.svelte.js';
import {emojis} from '$lib/emoji.js';

test('Project_Data fills defaults', () => {
	const project = Project_Data.parse({});
	assert.ok(project.id.length > 0);
	assert.deepEqual(project.realms, []);
	assert.deepEqual(project.level_stats, DEFAULT_LEVEL_STATS);
});

test('the default project name is two emoji', () => {
	const glyphs = new Set(emojis.map((e) => e.glyph));
	for (let i = 0; i < 20; i++) {
		const {name} = Project_Data.parse({});
		const [a, b] = Array.from(name);
		assert.ok(glyphs.has(a) && glyphs.has(b), name);
	}
});

test('Project_Data defaults nested realms and levels', () => {
	const project = Project_Data.parse({realms: [{levels: [{}]}]});
	const [realm] = project.realms;
	assert.strictEqual(realm.name, 'new realm');
	assert.strictEqual(realm.levels[0].name, 'new level');
});

// regression: object and array defaults were shared references, so mutating one parse leaked into others
test('Project_Data does not share mutable defaults', () => {
	const a = Project_Data.parse({});
	const b = Project_Data.parse({});
	a.level_stats.mistakes.x = [1];
	assert.deepEqual(b.level_stats.mistakes, {});
	assert.deepEqual(DEFAULT_LEVEL_STATS.mistakes, {});
	a.realms.push(Realm_Data.parse({}));
	assert.deepEqual(b.realms, []);
	const realm_a = Realm_Data.parse({});
	realm_a.levels.push(Level_Data.parse({}));
	assert.deepEqual(Realm_Data.parse({}).levels, []);
	const level_a = Level_Data.parse({});
	(level_a.intervals as Array<number>).push(99);
	assert.deepEqual(Level_Data.parse({}).intervals, DEFAULT_INTERVALS);
});

test('Project_Metadata is a projection of Project_Data', () => {
	const project = Project_Data.parse({name: 'p'});
	assert.deepEqual(Project_Metadata.parse(project), {id: project.id, name: 'p'});
});

test('Realm_Data rejects an empty name', () => {
	assert.ok(!Realm_Data.safeParse({name: ''}).success);
});

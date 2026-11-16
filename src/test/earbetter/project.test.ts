import {test, assert} from 'vitest';

import {ProjectData, ProjectMetadata} from '$lib/earbetter/project.js';
import {RealmData} from '$lib/earbetter/realm.js';
import {DEFAULT_INTERVALS, DEFAULT_LEVEL_STATS, LevelData} from '$lib/earbetter/level.svelte.js';
import {emojis} from '$lib/emoji.js';

test('ProjectData fills defaults', () => {
	const project = ProjectData.parse({});
	assert.ok(project.id.length > 0);
	assert.deepEqual(project.realms, []);
	assert.deepEqual(project.level_stats, DEFAULT_LEVEL_STATS);
});

test('the default project name is two emoji', () => {
	const glyphs = new Set(emojis.map((e) => e.glyph));
	for (let i = 0; i < 20; i++) {
		const {name} = ProjectData.parse({});
		const [a, b] = Array.from(name);
		assert.ok(glyphs.has(a) && glyphs.has(b), name);
	}
});

test('ProjectData defaults nested realms and levels', () => {
	const project = ProjectData.parse({realms: [{levels: [{}]}]});
	const [realm] = project.realms;
	assert.strictEqual(realm.name, 'new realm');
	assert.strictEqual(realm.levels[0].name, 'new level');
});

// regression: object and array defaults were shared references, so mutating one parse leaked into others
test('ProjectData does not share mutable defaults', () => {
	const a = ProjectData.parse({});
	const b = ProjectData.parse({});
	a.level_stats.mistakes.x = [1];
	assert.deepEqual(b.level_stats.mistakes, {});
	assert.deepEqual(DEFAULT_LEVEL_STATS.mistakes, {});
	a.realms.push(RealmData.parse({}));
	assert.deepEqual(b.realms, []);
	const realm_a = RealmData.parse({});
	realm_a.levels.push(LevelData.parse({}));
	assert.deepEqual(RealmData.parse({}).levels, []);
	const level_a = LevelData.parse({});
	(level_a.intervals as Array<number>).push(99);
	assert.deepEqual(LevelData.parse({}).intervals, DEFAULT_INTERVALS);
});

test('ProjectMetadata is a projection of ProjectData', () => {
	const project = ProjectData.parse({name: 'p'});
	assert.deepEqual(ProjectMetadata.parse(project), {id: project.id, name: 'p'});
});

test('RealmData rejects an empty name', () => {
	assert.ok(!RealmData.safeParse({name: ''}).success);
});

import * as s from '@fuzdev/fuz_schema/schema.ts';
import { test, assert } from 'vitest';

import { ProjectData, ProjectMetadata } from '#lib/earbetter/project.ts';
import { RealmData } from '#lib/earbetter/realm.ts';
import { DEFAULT_INTERVALS, DEFAULT_LEVEL_STATS, LevelData } from '#lib/earbetter/level.svelte.ts';
import { emojis } from '#lib/emoji.ts';

test('ProjectData fills defaults', () => {
	const project = s.parse_or_throw(ProjectData, {});
	assert.ok(project.id.length > 0);
	assert.deepEqual(project.realms, []);
	assert.deepEqual(project.level_stats, DEFAULT_LEVEL_STATS);
});

test('the default project name is two emoji', () => {
	const glyphs = new Set(emojis.map((e) => e.glyph));
	for (let i = 0; i < 20; i++) {
		const { name } = s.parse_or_throw(ProjectData, {});
		const [a, b] = Array.from(name);
		assert.ok(glyphs.has(a!) && glyphs.has(b!), name);
	}
});

test('ProjectData defaults nested realms and levels', () => {
	const project = s.parse_or_throw(ProjectData, { realms: [{ levels: [{}] }] });
	const realm = project.realms[0]!;
	assert.strictEqual(realm.name, 'new realm');
	assert.strictEqual(realm.levels[0]!.name, 'new level');
});

// regression: object and array defaults were shared references, so mutating one parse leaked into others
test('ProjectData does not share mutable defaults', () => {
	const a = s.parse_or_throw(ProjectData, {});
	const b = s.parse_or_throw(ProjectData, {});
	a.level_stats.mistakes.x = [1];
	assert.deepEqual(b.level_stats.mistakes, {});
	assert.deepEqual(DEFAULT_LEVEL_STATS.mistakes, {});
	a.realms.push(s.parse_or_throw(RealmData, {}));
	assert.deepEqual(b.realms, []);
	const realm_a = s.parse_or_throw(RealmData, {});
	realm_a.levels.push(s.parse_or_throw(LevelData, {}));
	assert.deepEqual(s.parse_or_throw(RealmData, {}).levels, []);
	const level_a = s.parse_or_throw(LevelData, {});
	(level_a.intervals as Array<number>).push(99);
	assert.deepEqual(s.parse_or_throw(LevelData, {}).intervals, DEFAULT_INTERVALS);
});

test('ProjectMetadata is a projection of ProjectData', () => {
	const project = s.parse_or_throw(ProjectData, { name: 'p' });
	assert.deepEqual(s.parse_or_throw(ProjectMetadata, project), { id: project.id, name: 'p' });
});

test('RealmData rejects an empty name', () => {
	assert.ok(!s.parse(RealmData, { name: '' }).ok);
});

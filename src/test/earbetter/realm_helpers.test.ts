import * as s from '@fuzdev/fuz_schema/schema.ts';
import { test, assert } from 'vitest';

import { to_default_scale_realm } from '#lib/earbetter/realm_helpers.ts';
import { RealmData } from '#lib/earbetter/realm.ts';
import { lookup_scale, scales } from '#lib/music.ts';

test('names the realm after the scale by default', () => {
	assert.strictEqual(to_default_scale_realm('major').name, 'major');
	assert.strictEqual(to_default_scale_realm('major', 'Ionian').name, 'Ionian');
});

test('compares each adjacent pair of scale notes, up and down', () => {
	const realm = to_default_scale_realm('major pentatonic');
	const names = realm.levels.map((l) => l.name);
	assert.include(names, 'major second vs major third');
	assert.include(names, 'major second vs major third (downward)');
	const downward = realm.levels.find((l) => l.name === 'major sixth vs perfect fifth (downward)');
	assert.strictEqual(downward, undefined); // pairs are ascending
	const pair = realm.levels.find((l) => l.name === 'perfect fifth vs major sixth (downward)');
	assert.deepEqual(pair?.intervals, [-5, -3]);
});

test('builds the same level shapes for every scale', () => {
	for (const scale of scales) {
		const realm = to_default_scale_realm(scale.name);
		const pairs = scale.notes.length - 1;
		assert.strictEqual(realm.levels.length, pairs * 2 + 9, scale.name);
		assert.deepEqual(s.parse_or_throw(RealmData, realm), realm, scale.name);
	}
});

test('level ids and names are unique within a realm', () => {
	for (const scale of scales) {
		const { levels } = to_default_scale_realm(scale.name);
		assert.strictEqual(new Set(levels.map((l) => l.id)).size, levels.length, scale.name);
		assert.strictEqual(new Set(levels.map((l) => l.name)).size, levels.length, scale.name);
	}
});

test('the octave levels use the scale notes', () => {
	const { levels } = to_default_scale_realm('minor');
	const one_octave = levels.find((l) => l.name === 'one octave');
	assert.deepEqual(one_octave?.intervals, lookup_scale('minor').notes);
});

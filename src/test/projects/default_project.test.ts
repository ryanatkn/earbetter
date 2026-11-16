import * as s from '@fuzdev/fuz_schema/schema.ts';
import { describe, test, assert } from 'vitest';
import { create_random_alea } from '@fuzdev/fuz_util/random_alea.ts';

import default_project from '#lib/projects/default_project.ts';
import {
	create_next_trial,
	create_valid_notes,
	to_level_data_error
} from '#lib/earbetter/level.svelte.ts';
import { ProjectData } from '#lib/earbetter/project.ts';

const project = default_project();
const levels = project.realms.flatMap((realm) =>
	realm.levels.map((level) => ({ label: `${realm.name} / ${level.name}`, level }))
);

test('creates fresh ids each call', () => {
	const other = default_project();
	assert.notStrictEqual(other.id, project.id);
	assert.notStrictEqual(other.realms[0]!.id, project.realms[0]!.id);
});

test('parses as project data', () => {
	assert.deepEqual(s.parse_or_throw(ProjectData, JSON.parse(JSON.stringify(project))), project);
});

test('ids are unique across the project', () => {
	const ids = [project.id, ...project.realms.map((r) => r.id), ...levels.map((l) => l.level.id)];
	assert.strictEqual(new Set(ids).size, ids.length);
});

describe('every shipped level is playable', () => {
	test.each(levels)('$label', ({ level }) => {
		assert.strictEqual(to_level_data_error(level), null);
		assert.ok(level.min_note < level.max_note);
		assert.ok(level.sequence_length >= 2);
		assert.ok(level.trial_count >= 1);
		// every interval is reachable from some tonic in range
		for (const interval of level.intervals) {
			assert.ok(level.max_note - level.min_note >= Math.abs(interval), `interval ${interval}`);
		}
		const random = create_random_alea(level.name);
		for (let i = 0; i < 50; i++) {
			const trial = create_next_trial(level, null, random);
			assert.strictEqual(trial.sequence.length, level.sequence_length);
		}
	});

	test.each(levels)('$label has every tonic in a usable range', ({ level }) => {
		// the tonics a trial can draw from must each leave at least one interval to guess
		const usable = [];
		for (let tonic = level.min_note; tonic <= level.max_note; tonic++) {
			try {
				create_valid_notes(tonic, level.min_note, level.max_note, level.intervals);
				usable.push(tonic);
			} catch {}
		}
		assert.ok(usable.length > 0);
	});
});

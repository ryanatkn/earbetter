import * as s from '@fuzdev/fuz_schema/schema.ts';
import { random_item } from '@fuzdev/fuz_util/random.ts';

import { DEFAULT_LEVEL_STATS, LevelStats } from './level.svelte.ts';
import { emojis } from '../emoji.ts';
import { RealmData } from './realm.ts';
import { to_random_id } from '../id.ts';

export const ProjectId = s.flavor(s.string, 'ProjectId');
export type ProjectId = s.Infer<typeof ProjectId>;
export const create_project_id = (): ProjectId => to_random_id();

export const ProjectName = s.flavor(
	s.pipe(s.string, s.min_length(1), s.max_length(1000)),
	'ProjectName'
);
export type ProjectName = s.Infer<typeof ProjectName>;
const random_project_name = (): ProjectName =>
	random_item(emojis).glyph + random_item(emojis).glyph;

// Like `ProjectData` but just the stuff needed for display.
// Used to avoid loading every project into memory at startup.
// strips unknown keys because it's persisted across versions
export const ProjectMetadata = s.strip_object({
	id: ProjectId,
	name: ProjectName
});
export type ProjectMetadata = s.Infer<typeof ProjectMetadata>;

// strips unknown keys because it's persisted and imported across versions
export const ProjectData = s.strip_object({
	id: s.with_default_fn(ProjectId, create_project_id),
	name: s.with_default_fn(ProjectName, random_project_name),
	realms: s.with_default_fn(s.array(RealmData), () => []),
	level_stats: s.with_default_fn(LevelStats, () => structuredClone(DEFAULT_LEVEL_STATS))
});
export type ProjectData = s.Infer<typeof ProjectData>;
export type ProjectDataInput = s.InferInput<typeof ProjectData>;

import {z} from 'zod';
import {random_item} from '@ryanatkn/belt/random.js';
import type {Flavored} from '@ryanatkn/belt/types.js';

import {DEFAULT_LEVEL_STATS, LevelStats} from '$lib/earbetter/level.svelte.js';
import {emojis} from '$lib/emoji.js';
import {RealmData} from '$lib/earbetter/realm.js';
import {to_random_id} from '$lib/id.js';

export const ProjectId = z.string();
export type ProjectId = Flavored<z.infer<typeof ProjectId>, 'ProjectId'>; // TODO @many this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
export const create_project_id = (): ProjectId => to_random_id();

export const ProjectName = z.string().min(1).max(1000);
export type ProjectName = Flavored<z.infer<typeof ProjectName>, 'ProjectName'>; // TODO @many this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
const random_project_name = (): ProjectName =>
	random_item(emojis).glyph + random_item(emojis).glyph;

// Like `ProjectData` but just the stuff needed for display.
// Used to avoid loading every project into memory at startup.
export const ProjectMetadata = z.object({
	id: ProjectId,
	name: ProjectName,
});
export type ProjectMetadata = z.infer<typeof ProjectMetadata>;

export const ProjectData = z.object({
	id: ProjectId.default(create_project_id),
	name: ProjectName.default(random_project_name),
	realms: z.array(RealmData).default(() => []),
	level_stats: LevelStats.default(() => structuredClone(DEFAULT_LEVEL_STATS)),
});
export type ProjectData = z.infer<typeof ProjectData>;

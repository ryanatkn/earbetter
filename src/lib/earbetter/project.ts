import {z} from 'zod';
import {random_item} from '@ryanatkn/belt/random.js';
import type {Flavored} from '@ryanatkn/belt/types.js';

import {DEFAULT_LEVEL_STATS, LevelStats} from '$lib/earbetter/level.js';
import {emojis} from '$lib/emoji';
import {RealmData} from '$lib/earbetter/realm';
import {to_random_id} from '$lib/id';

export const ProjectId = z.string();
export type ProjectId = Flavored<z.infer<typeof ProjectId>, 'ProjectId'>;
export const create_project_id = (): ProjectId => to_random_id();

export const ProjectName = z.string().min(1).max(1000);
export type ProjectName = Flavored<z.infer<typeof ProjectName>, 'ProjectName'>;
const random_project_name = (): ProjectName => random_item(emojis).icon + random_item(emojis).icon;

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
	realms: z.array(RealmData).default([]),
	level_stats: LevelStats.default(DEFAULT_LEVEL_STATS),
});
export type ProjectData = z.infer<typeof ProjectData>;

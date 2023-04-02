import {z} from 'zod';
import {randomItem, type Flavored} from '@feltjs/util';
import {signal, Signal} from '@preact/signals-core';
import {identity} from '@feltjs/util/function.js';

import {DEFAULT_LEVEL_STATS, LevelStats} from '$lib/earbetter/level';
import {emojis} from '$lib/util/emoji';
import {RealmData} from '$lib/earbetter/realm';

export type ProjectId = Flavored<string, 'ProjectId'>;
export const ProjectId = z.string().uuid().transform<ProjectId>(identity); // TODO better way to do this?
export const create_project_id = (): ProjectId => crypto.randomUUID();

export type ProjectName = Flavored<string, 'ProjectName'>;
export const ProjectName = z.string().min(1).max(1000).transform<ProjectName>(identity); // TODO better way to do this?
const random_project_name = (): ProjectName => randomItem(emojis).icon + randomItem(emojis).icon;

// Like `ProjectData` but just the stuff needed for display.
// Used to avoid loading every project into memory at startup.
export const ProjectMetadata = z.object({
	id: ProjectId,
	name: ProjectName,
});
export type ProjectMetadata = z.infer<typeof ProjectMetadata>;

// TODO add restrictions to the below def
export const ProjectData = z.object({
	id: ProjectId.default(create_project_id),
	name: ProjectName.default(random_project_name),
	realms: z.array(RealmData).default([]),
	level_stats: LevelStats.default(DEFAULT_LEVEL_STATS),
});
export type ProjectData = z.infer<typeof ProjectData>;

export interface Project {
	def: Signal<ProjectData>;
}

export class Project {
	def: Signal<ProjectData>;

	constructor(def: ProjectData) {
		this.def = signal(def);
	}
}

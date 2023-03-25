import {z} from 'zod';
import {randomItem, type Flavored} from '@feltjs/util';
import {signal, Signal} from '@preact/signals-core';
import {identity} from '@feltjs/util/function.js';

import {DEFAULT_LEVEL_STATS, LevelDef, LevelStats} from '$lib/earbetter/level';
import {default_level_defs} from '$lib/earbetter/level_defs';
import {emojis} from '$lib/util/emoji';
import {RealmDef} from '$lib/earbetter/realm';
import {default_realm_defs} from '$lib/earbetter/realm_defs';

export type ProjectId = Flavored<string, 'ProjectId'>;
export const ProjectId = z.string().uuid().transform<ProjectId>(identity); // TODO better way to do this?
export const create_project_id = (): ProjectId => crypto.randomUUID();

export type ProjectName = Flavored<string, 'ProjectName'>;
export const ProjectName = z.string().min(1).max(1000).transform<ProjectName>(identity); // TODO better way to do this?

// Like `ProjectDef` but just the stuff needed for display.
// Used to avoid loading every project into memory at startup.
export const ProjectMetadata = z.object({
	id: ProjectId,
	name: z.string(),
});
export type ProjectMetadata = z.infer<typeof ProjectMetadata>;

// TODO add restrictions to the below def
export const ProjectDef = z.object({
	id: ProjectId,
	name: z.string(),
	level_defs: z.array(LevelDef),
	level_stats: LevelStats,
	realm_defs: z.array(RealmDef),
});
export type ProjectDef = z.infer<typeof ProjectDef>;

export interface Project {
	def: Signal<ProjectDef>;
}

export class Project {
	def: Signal<ProjectDef>;

	constructor(def: ProjectDef) {
		this.def = signal(def);
	}
}

export const create_project_def = (partial?: Partial<ProjectDef>): ProjectDef => ({
	id: partial?.id ?? create_project_id(),
	name: partial?.name ?? random_project_name(),
	level_defs: partial?.level_defs ?? default_level_defs,
	level_stats: partial?.level_stats ?? DEFAULT_LEVEL_STATS,
	realm_defs: partial?.realm_defs ?? default_realm_defs,
});

const random_project_name = (): ProjectName => randomItem(emojis).icon + randomItem(emojis).icon;

// TODO probably fill this out with a runtime wrapping `Project` class (or Svelte component?)

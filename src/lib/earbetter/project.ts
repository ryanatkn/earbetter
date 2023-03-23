import {z} from 'zod';
import {randomItem, type Flavored} from '@feltjs/util';
import {signal, Signal} from '@preact/signals-core';

import {LevelDef} from '$lib/earbetter/level';
import {level_defs} from '$lib/earbetter/level_defs';
import {emojis} from '$lib/util/emoji';

export type ProjectId = Flavored<string, 'ProjectId'>;
export const ProjectId = z
	.string()
	.uuid()
	.transform((t) => t as ProjectId); // TODO better way to do this?

export type ProjectName = Flavored<string, 'ProjectName'>;
export const ProjectName = z
	.string()
	.min(1)
	.max(1000)
	.transform((t) => t as ProjectName); // TODO better way to do this?

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
});
export type ProjectDef = z.infer<typeof ProjectDef>;

export interface Project {
	def: Signal<ProjectDef>;
}

export const create_project_id = (): ProjectId => crypto.randomUUID();

export class Project {
	def: Signal<ProjectDef>;

	constructor(def: ProjectDef) {
		this.def = signal(def);
	}
}

export const create_project_def = (): ProjectDef => ({
	id: create_project_id(),
	name: random_project_name(),
	level_defs,
});

const random_project_name = (): ProjectName => randomItem(emojis).icon + randomItem(emojis).icon;

// TODO probably fill this out with a runtime wrapping `Project` class (or Svelte component?)

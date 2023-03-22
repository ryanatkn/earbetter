import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {signal, Signal} from '@preact/signals-core';

export type ProjectId = Flavored<string, 'Project'>;
export const ProjectId = z
	.string()
	.uuid()
	.transform((t) => t as ProjectId);

// TODO add restrictions to the below def
export const ProjectDef = z.object({
	id: ProjectId,
	name: z.string(),
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
	name: 'new project',
});

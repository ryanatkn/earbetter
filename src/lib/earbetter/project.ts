import {z} from 'zod';
import {random_item} from '@ryanatkn/belt/random.js';
import type {Flavored} from '@ryanatkn/belt/types.js';

import {DEFAULT_LEVEL_STATS, Level_Stats} from '$lib/earbetter/level.js';
import {emojis} from '$lib/emoji.js';
import {Realm_Data} from '$lib/earbetter/realm.js';
import {to_random_id} from '$lib/id.js';

export const Project_Id = z.string();
export type Project_Id = Flavored<z.infer<typeof Project_Id>, 'Project_Id'>; // TODO @multiple this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
export const create_project_id = (): Project_Id => to_random_id();

export const Project_Name = z.string().min(1).max(1000);
export type Project_Name = Flavored<z.infer<typeof Project_Name>, 'Project_Name'>; // TODO @multiple this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
const random_project_name = (): Project_Name =>
	random_item(emojis).glyph + random_item(emojis).glyph;

// Like `Project_Data` but just the stuff needed for display.
// Used to avoid loading every project into memory at startup.
export const Project_Metadata = z.object({
	id: Project_Id,
	name: Project_Name,
});
export type Project_Metadata = z.infer<typeof Project_Metadata>;

export const Project_Data = z.object({
	id: Project_Id.default(create_project_id),
	name: Project_Name.default(random_project_name),
	realms: z.array(Realm_Data).default([]),
	level_stats: Level_Stats.default(DEFAULT_LEVEL_STATS),
});
export type Project_Data = z.infer<typeof Project_Data>;

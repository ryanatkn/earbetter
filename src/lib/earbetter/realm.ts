import {z} from 'zod';
import type {Flavored} from '@ryanatkn/belt/types.js';

import {Level_Data} from '$lib/earbetter/level.svelte.js';
import {to_random_id} from '$lib/id.js';

export const Realm_Id = z.string();
export type Realm_Id = Flavored<z.infer<typeof Realm_Id>, 'Realm_Id'>; // TODO @multiple this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
export const create_realm_id = (): Realm_Id => to_random_id();

export const Realm_Name = z.string().min(1).max(1000);
export type Realm_Name = Flavored<z.infer<typeof Realm_Name>, 'Realm_Name'>; // TODO @multiple this doesn't work when used as a schema, use z.brand() instead? or are the egonomics too bad?
const DEFAULT_REALM_NAME = 'new realm';

export const Realm_Data = z.object({
	id: Realm_Id.default(create_realm_id),
	name: Realm_Name.default(DEFAULT_REALM_NAME),
	levels: z.array(Level_Data).default([]),
});
export type Realm_Data = z.infer<typeof Realm_Data>;

import {z} from 'zod';
import type {Flavored} from '@ryanatkn/belt/types.js';

import {Level_Data} from '$lib/earbetter/level.js';
import {to_random_id} from '$lib/id.js';

export const Realm_Id = z.string();
export type Realm_Id = Flavored<z.infer<typeof Realm_Id>, 'Realm_Id'>;
export const create_realm_id = (): Realm_Id => to_random_id();

export const RealmName = z.string().min(1).max(1000);
export type RealmName = Flavored<z.infer<typeof RealmName>, 'RealmName'>;
const DEFAULT_REALM_NAME = 'new realm';

export const Realm_Data = z.object({
	id: Realm_Id.default(create_realm_id),
	name: RealmName.default(DEFAULT_REALM_NAME),
	levels: z.array(Level_Data).default([]),
});
export type Realm_Data = z.infer<typeof Realm_Data>;

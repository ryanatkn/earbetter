import {z} from 'zod';
import type {Flavored} from '@grogarden/util/types.js';

import {LevelData} from '$lib/earbetter/level';
import {to_random_id} from '$lib/id';

export const RealmId = z.string();
export type RealmId = Flavored<z.infer<typeof RealmId>, 'RealmId'>;
export const create_realm_id = (): RealmId => to_random_id();

export const RealmName = z.string().min(1).max(1000);
export type RealmName = Flavored<z.infer<typeof RealmName>, 'RealmName'>;
const DEFAULT_REALM_NAME = 'new realm';

export const RealmData = z.object({
	id: RealmId.default(create_realm_id),
	name: RealmName.default(DEFAULT_REALM_NAME),
	levels: z.array(LevelData).default([]),
});
export type RealmData = z.infer<typeof RealmData>;

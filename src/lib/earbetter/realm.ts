import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

import {LevelData} from '$lib/earbetter/level';
import {to_random_id} from '$lib/id';

export type RealmId = Flavored<string, 'RealmId'>;
export const RealmId = z.string().transform<RealmId>(identity);
export const create_realm_id = (): RealmId => to_random_id();

export type RealmName = Flavored<string, 'RealmName'>;
export const RealmName = z.string().min(1).max(1000).transform<RealmName>(identity); // TODO better way to do this?
const DEFAULT_REALM_NAME = 'new realm';

export const RealmData = z.object({
	id: RealmId.default(create_realm_id),
	name: RealmName.default(DEFAULT_REALM_NAME),
	levels: z.array(LevelData).default([]),
});
export type RealmData = z.infer<typeof RealmData>;

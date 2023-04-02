import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

import {LevelData} from '$lib/earbetter/level';

export type RealmId = Flavored<string, 'RealmId'>;
export const RealmId = z.string().uuid().transform<RealmId>(identity);
export const create_realm_id = (): RealmId => crypto.randomUUID();

export type RealmName = Flavored<string, 'RealmName'>;
export const RealmName = z.string().min(1).max(1000).transform<RealmName>(identity); // TODO better way to do this?
const DEFAULT_REALM_NAME = 'new realm';

// TODO add restrictions to the below def
export const RealmDef = z.object({
	id: RealmId.default(create_realm_id),
	name: RealmName.default(DEFAULT_REALM_NAME),
	level_datas: z.array(LevelData).default([]),
});
export type RealmDef = z.infer<typeof RealmDef>;

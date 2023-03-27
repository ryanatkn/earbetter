import {z} from 'zod';
import type {Flavored} from '@feltjs/util';
import {identity} from '@feltjs/util/function.js';

import {LevelDef} from '$lib/earbetter/level';

export type RealmId = Flavored<string, 'Realm'>;
export const RealmId = z.string().uuid().transform<RealmId>(identity);
export const create_realm_id = (): RealmId => crypto.randomUUID();

export type RealmName = Flavored<string, 'RealmName'>;
export const RealmName = z.string().min(1).max(1000).transform<RealmName>(identity); // TODO better way to do this?

// TODO add restrictions to the below def
export const RealmDef = z.object({
	id: RealmId,
	name: RealmName,
	level_defs: z.array(LevelDef),
});
export type RealmDef = z.infer<typeof RealmDef>;

const DEFAULT_REALM_NAME = 'new realm';

export const create_realm_def = (partial?: Partial<RealmDef>): RealmDef => ({
	id: partial?.id ?? create_realm_id(),
	name: partial?.name ?? DEFAULT_REALM_NAME,
	level_defs: partial?.level_defs ?? [],
});

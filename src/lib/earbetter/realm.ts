import * as s from '@fuzdev/fuz_schema/schema.ts';

import { LevelData } from './level.svelte.ts';
import { to_random_id } from '../id.ts';

export const RealmId = s.flavor(s.string, 'RealmId');
export type RealmId = s.Infer<typeof RealmId>;
export const create_realm_id = (): RealmId => to_random_id();

export const RealmName = s.flavor(
	s.pipe(s.string, s.min_length(1), s.max_length(1000)),
	'RealmName'
);
export type RealmName = s.Infer<typeof RealmName>;
const DEFAULT_REALM_NAME = 'new realm';

// strips unknown keys because it's persisted and imported across versions
export const RealmData = s.strip_object({
	id: s.with_default_fn(RealmId, create_realm_id),
	name: s.with_default(RealmName, DEFAULT_REALM_NAME),
	levels: s.with_default_fn(s.array(LevelData), () => [])
});
export type RealmData = s.Infer<typeof RealmData>;
export type RealmDataInput = s.InferInput<typeof RealmData>;

import * as s from '@fuzdev/fuz_schema/schema.ts';

import { Volume, Instrument, DEFAULT_VOLUME, DEFAULT_INSTRUMENT } from './audio_helpers.ts';
import { DEFAULT_PITCH_CLASS, DEFAULT_SCALE, PitchClass, Scale } from './music.ts';

// TODO name for this? `SiteData`, `GlobalState`, `UserSettings`, something else?

// strips unknown keys because it's persisted across versions
export const SiteData = s.strip_object({
	volume: s.with_default(Volume, DEFAULT_VOLUME),
	instrument: s.with_default(Instrument, DEFAULT_INSTRUMENT),
	scale: s.with_default(Scale, DEFAULT_SCALE),
	key: s.with_default(PitchClass, DEFAULT_PITCH_CLASS)
});
export type SiteData = s.Infer<typeof SiteData>;

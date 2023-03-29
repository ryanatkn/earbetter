import {z} from 'zod';

import {Volume, Instrument, DEFAULT_VOLUME, DEFAULT_INSTRUMENT} from '$lib/audio/helpers';
import {DEFAULT_PITCH_CLASS, DEFAULT_SCALE, PitchClass, Scale} from '$lib/music/helpers';

// TODO name for this? `SiteData`, `GlobalState`, `UserSettings`, etc etc

export const SiteData = z.object({
	volume: Volume.default(DEFAULT_VOLUME),
	instrument: Instrument.default(DEFAULT_INSTRUMENT),
	scale: Scale.default(DEFAULT_SCALE),
	key: PitchClass.default(DEFAULT_PITCH_CLASS),
});
export type SiteData = z.infer<typeof SiteData>;

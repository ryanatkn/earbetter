import {z} from 'zod';

import {Volume, Instrument} from '$lib/audio/helpers';

// TODO name for this? `SiteData`, `GlobalState`, `UserSettings`, etc etc

export const SiteData = z.object({
	volume: Volume,
	instrument: Instrument,
});
export type SiteData = z.infer<typeof SiteData>;

// export const PianoSettings = z.object({
//   note_min: Midi
// })

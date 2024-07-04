import {z} from 'zod';

import {Volume, Instrument, DEFAULT_VOLUME, DEFAULT_INSTRUMENT} from '$lib/audio_helpers.js';
import {DEFAULT_PITCH_CLASS, DEFAULT_SCALE, Pitch_Class, Scale} from '$lib/music.js';

// TODO name for this? `Site_Data`, `Global_State`, `User_Settings`, something else?

export const Site_Data = z.object({
	volume: Volume.default(DEFAULT_VOLUME),
	instrument: Instrument.default(DEFAULT_INSTRUMENT),
	scale: Scale.default(DEFAULT_SCALE),
	key: Pitch_Class.default(DEFAULT_PITCH_CLASS),
});
export type Site_Data = z.infer<typeof Site_Data>;

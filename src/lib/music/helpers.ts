export const DEFAULT_TUNING = 440; // https://en.wikipedia.org/wiki/A440_(pitch_standard)

export const interval_short_names = Object.freeze([
	'P1',
	'm2',
	'M2',
	'm3',
	'M3',
	'P4',
	'd5',
	'P5',
	'm6',
	'M6',
	'm7',
	'M7',
	'P8',
] as const);

export type IntervalShortNames = (typeof interval_short_names)[number];

export const interval_names = Object.freeze([
	'perfect unison',
	'minor second',
	'major second',
	'minor third',
	'major third',
	'perfect fourth',
	'diminished fifth',
	'perfect fifth',
	'minor sixth',
	'major sixth',
	'minor seventh',
	'major seventh',
	'perfect octave',
] as const);

export type IntervalNames = (typeof interval_names)[number];

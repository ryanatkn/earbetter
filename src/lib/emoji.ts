import * as s from '@fuzdev/fuz_schema/schema.ts';

export const Emoji = s.object({
	glyph: s.string // TODO check
});
export type Emoji = s.Infer<typeof Emoji>;

export const emojis: Array<Emoji> = [
	{ glyph: '🐵' },
	{ glyph: '🐶' },
	{ glyph: '🐺' },
	{ glyph: '🦊' },
	{ glyph: '🐱' },
	{ glyph: '🦁' },
	{ glyph: '🐯' },
	{ glyph: '🐴' },
	{ glyph: '🦄' },
	{ glyph: '🐮' },
	{ glyph: '🐭' },
	{ glyph: '🐹' },
	{ glyph: '🐰' },
	{ glyph: '🐻' },
	{ glyph: '🐼' },
	{ glyph: '🐸' },
	{ glyph: '🐲' }
];

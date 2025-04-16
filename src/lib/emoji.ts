import {z} from 'zod';

export const Emoji = z.object({
	glyph: z.string(), // TODO check
});
export type Emoji = z.infer<typeof Emoji>;

export const emojis: Array<Emoji> = [
	{glyph: '🐵'},
	{glyph: '🐶'},
	{glyph: '🐺'},
	{glyph: '🦊'},
	{glyph: '🐱'},
	{glyph: '🦁'},
	{glyph: '🐯'},
	{glyph: '🐴'},
	{glyph: '🦄'},
	{glyph: '🐮'},
	{glyph: '🐭'},
	{glyph: '🐹'},
	{glyph: '🐰'},
	{glyph: '🐻'},
	{glyph: '🐼'},
	{glyph: '🐸'},
	{glyph: '🐲'},
];

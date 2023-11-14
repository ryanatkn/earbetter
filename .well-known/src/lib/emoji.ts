import {z} from 'zod';

export const Emoji = z.object({
	icon: z.string(), // TODO check
});
export type Emoji = z.infer<typeof Emoji>;

export const emojis: Emoji[] = [
	{icon: '🐵'},
	{icon: '🐶'},
	{icon: '🐺'},
	{icon: '🦊'},
	{icon: '🐱'},
	{icon: '🦁'},
	{icon: '🐯'},
	{icon: '🐴'},
	{icon: '🦄'},
	{icon: '🐮'},
	{icon: '🐭'},
	{icon: '🐹'},
	{icon: '🐰'},
	{icon: '🐻'},
	{icon: '🐼'},
	{icon: '🐸'},
	{icon: '🐲'},
];

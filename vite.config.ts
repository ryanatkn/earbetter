import {defineConfig} from 'vitest/config';
import {sveltekit} from '@sveltejs/kit/vite';

export default defineConfig(({mode}) => ({
	plugins: [sveltekit()],
	// in test mode, use browser conditions and client transforms
	// so Svelte's runes and effects behave like they do in the app
	resolve: mode === 'test' ? {conditions: ['browser']} : undefined,
	test: {testTransformMode: {web: ['**/*.test.ts']}},
}));

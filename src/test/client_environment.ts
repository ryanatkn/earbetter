import type { Environment } from 'vitest/runtime';

/**
 * Runs tests in Node with Vite's client transforms, so `.svelte.ts` modules compile
 * for the client and Svelte's runes and effects behave like they do in the app,
 * without a DOM implementation. Tests stub the browser globals they touch.
 */
export default {
	name: 'client',
	viteEnvironment: 'client',
	setup: () => ({ teardown: () => {} })
} satisfies Environment;

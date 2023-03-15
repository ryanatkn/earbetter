import {typescript} from 'svelte-preprocess-esbuild';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {immutable: true},
	kit: {
		adapter: adapter(),
		paths: {base: '/earworm'},
		files: {assets: 'src/static'},
		alias: {$routes: 'src/routes'},
	},
};
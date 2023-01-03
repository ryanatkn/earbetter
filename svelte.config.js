import {typescript} from 'svelte-preprocess-esbuild';
import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {immutable: true},
	kit: {
		adapter: adapter(),
		paths: dev ? undefined : {base: '/earworm'},
		files: {assets: 'src/static'},
	},
};

import {typescript} from 'svelte-preprocess-esbuild';
import adapter from '@sveltejs/adapter-static';

// const dev = process.argv.includes('dev'); // see below

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {immutable: true},
	kit: {
		adapter: adapter(),
		// paths: dev ? undefined : {base: '/felt-template'}, // for GitHub pages -- delete this line for top-level domains
		files: {assets: 'src/static'},
	},
};

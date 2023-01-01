import {sveltekit} from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	envPrefix: 'PUBLIC_',
	optimizeDeps: {exclude: ['@feltcoop/felt']},
};

export default config;

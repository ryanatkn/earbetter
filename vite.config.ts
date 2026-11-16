import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { execSync } from 'node:child_process';
import { create_csp_directives } from '@fuzdev/fuz_ui/csp.ts';
import { csp_directives_of_fuzdev } from '@fuzdev/fuz_ui/csp_of_fuzdev.ts';
import { vite_plugin_fuz_css } from '@fuzdev/fuz_css/vite_plugin_fuz_css.ts';
import { vite_plugin_pkg_json } from '@fuzdev/fuz_ui/vite_plugin_pkg_json.ts';

export default defineConfig(({ mode }) => ({
	plugins: [
		sveltekit({
			preprocess: [vitePreprocess()],
			compilerOptions: { runes: true },
			inspector: true,
			adapter: adapter(),
			paths: { relative: false }, // use root-absolute paths for SSR path comparison: https://svelte.dev/docs/kit/configuration#paths
			csp: {
				directives: create_csp_directives({
					extend: [csp_directives_of_fuzdev]
				})
			},
			version: { name: execSync('git rev-parse HEAD').toString().trim() }
		}),
		vite_plugin_fuz_css(),
		vite_plugin_pkg_json()
	],
	// in test mode, use browser conditions so Svelte's runes and effects behave like they do in the app
	resolve: mode === 'test' ? { conditions: ['browser'] } : undefined,
	test: { environment: './src/test/client_environment.ts' },
	optimizeDeps: { exclude: ['@fuzdev/blake3-wasm'] },
	server: {
		// Vite watches the whole root, an inotify watch per file, and gro's `.gro/` output
		// needn't come out of the user's `max_user_watches` budget
		watch: { ignored: ['**/.gro/**'] }
	}
}));

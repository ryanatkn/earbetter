<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import 'virtual:fuz.css';
	import './style.css';

	import ThemeRoot from '@fuzdev/fuz_ui/ThemeRoot.svelte';
	import { load_color_scheme, load_theme, ThemeState } from '@fuzdev/fuz_ui/theme_state.svelte.ts';
	import { SiteState, site_context } from '@fuzdev/fuz_ui/site.svelte.ts';
	import pkg_json from 'virtual:pkg.json';
	import { is_editable, swallow } from '@fuzdev/fuz_util/dom.ts';
	import { noop } from '@fuzdev/fuz_util/function.ts';
	import Dialog from '@fuzdev/fuz_ui/Dialog.svelte';
	import { untrack, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { BROWSER } from 'esm-env';

	import { audio_context_context } from '#lib/audio_context.ts';
	import { request_access } from '#lib/midi_access.ts';
	import { App, app_context } from '#lib/earbetter/app.svelte.ts';
	import { load_from_storage, set_in_storage } from '#lib/storage.ts';
	import { SiteData } from './site_data.ts';
	import InitAudioContext from '#lib/InitAudioContext.svelte';
	import MainMenu from './MainMenu.svelte';
	import { main_menu_context } from './main_menu_state.svelte.ts';
	import { LevelHashData } from '#lib/earbetter/level.svelte.ts';
	import { parse_from_hash } from '#lib/url.ts';
	import { logo_earbetter } from '#lib/logos.ts';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();

	const theme_state = new ThemeState({
		theme: load_theme(),
		color_scheme: load_color_scheme('dark')
	});

	site_context.set(new SiteState({ icon: logo_earbetter, pkg_json }));

	// load site data
	const SITE_DATA_STORAGE_KEY = 'site';
	const initial_site_data = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => s.parse_or_throw(SiteData, {}),
		(v) => s.parse_or_throw(SiteData, v)
	);
	const get_audio_context = audio_context_context.set();

	const app = app_context.set(new App(get_audio_context, initial_site_data));
	if (BROWSER) (window as any).app = app;

	const main_menu = main_menu_context.set();

	const current_level_hash_data = $derived.by(() => {
		const parsed = s.parse(LevelHashData, parse_from_hash(page.url.hash));
		return parsed.ok ? parsed.value : null;
	});
	$effect(() => {
		const d = current_level_hash_data;
		untrack(() => app.set_active_level_data(d?.level ?? null));
	});

	// save site data
	const to_site_data = (): SiteData => ({
		// note these have to use `.value`, the `$`-prefix doesn't work for reactivity
		volume: app.volume,
		instrument: app.instrument,
		scale: app.scale,
		key: app.key
	});

	// TODO @many probably refactor, maybe combining the two into one piece of state
	let inited_site_data_save = false;
	$effect(() => {
		const site_data = to_site_data();
		if (inited_site_data_save) {
			set_in_storage(SITE_DATA_STORAGE_KEY, site_data);
		} else {
			inited_site_data_save = true;
		}
	});

	// TODO @many probably refactor, maybe combining the two into one piece of state
	let inited_app_save = false;
	$effect(() => {
		const data = app.toJSON();
		if (inited_app_save) {
			app.save(data);
		} else {
			inited_app_save = true;
		}
	});

	// TODO refactor
	const keydown = (e: KeyboardEvent) => {
		if (is_editable(e.target) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			return;
		}
		switch (e.key) {
			case 'c': {
				swallow(e);
				request_access(app).catch(noop); // the shortcut has no UI for failures, the button reports them
				return;
			}
			case '1': {
				swallow(e);
				app.instrument = 'sawtooth';
				return;
			}
			case '2': {
				swallow(e);
				app.instrument = 'sine';
				return;
			}
			case '3': {
				swallow(e);
				app.instrument = 'square';
				return;
			}
			case '4': {
				swallow(e);
				app.instrument = 'triangle';
				return;
			}
			case 'Escape': {
				// TODO hacky, maybe change the inner `Dialog` to use `capture`? but that's less flexible
				if (!main_menu.opened && document.getElementsByClassName('dialog').length) return;
				swallow(e);
				main_menu.toggle();
				return;
			}
		}
	};
</script>

<svelte:head>
	<title>Earbetter</title>
</svelte:head>

<svelte:window onkeydown={keydown} />

<InitAudioContext />

<ThemeRoot {theme_state}>
	{@render children()}

	{#if main_menu.opened}
		<Dialog onclose={() => main_menu.close()}>
			<div class="box width_atmost_md mx_auto">
				<div class="pane">
					<MainMenu />
				</div>
			</div>
		</Dialog>
	{/if}
</ThemeRoot>

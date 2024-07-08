<script lang="ts">
	import '@ryanatkn/moss/style.css';
	import '@ryanatkn/moss/theme.css';
	import '$lib/style.css';

	import Themed from '@ryanatkn/fuz/Themed.svelte';
	import {is_editable, swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import {sync_color_scheme, Themer} from '@ryanatkn/fuz/theme.svelte.js';
	import {untrack, type Snippet} from 'svelte';
	import {page} from '$app/stores';
	import {BROWSER} from 'esm-env';

	import {set_audio_context} from '$lib/audio_context.js';
	import {request_access} from '$lib/midi_access.js';
	import {App, set_app} from '$lib/earbetter/app.svelte.js';
	import {load_from_storage, set_in_storage} from '$lib/storage.js';
	import {Site_Data} from '$routes/site_data.js';
	import Init_Audio_Context from '$lib/Init_Audio_Context.svelte';
	import Main_Menu from '$routes/Main_Menu.svelte';
	import {set_main_menu} from '$routes/main_menu_state.svelte.js';
	import {Level_Hash_Data} from '$lib/earbetter/level.svelte.js';
	import {parse_from_hash} from '$lib/url.js';

	interface Props {
		children: Snippet;
	}

	const {children}: Props = $props();

	const themer = new Themer(undefined, 'dark');
	sync_color_scheme(themer.color_scheme); // TODO probably shouldn't be needed

	// load site data
	const SITE_DATA_STORAGE_KEY = 'site';
	const initial_site_data = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => Site_Data.parse({}),
		Site_Data.parse,
	);
	console.log(`initial_site_data`, initial_site_data);

	const get_audio_context = set_audio_context();

	const app = set_app(new App(get_audio_context, initial_site_data));
	if (BROWSER) (window as any).app = app;

	const main_menu = set_main_menu();

	const current_level_hash_data = $derived.by(() => {
		const parsed = Level_Hash_Data.safeParse(parse_from_hash($page.url.hash));
		return parsed.success ? parsed.data : null;
	});
	$effect(() => {
		const d = current_level_hash_data;
		untrack(() => app.set_active_level_data(d?.level ?? null));
	});

	// save site data
	const to_site_data = (): Site_Data => ({
		// note these have to use `.value`, the `$`-prefix doesn't work for reactivity
		volume: app.volume,
		instrument: app.instrument,
		scale: app.scale,
		key: app.key,
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
				void request_access(app);
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

<Init_Audio_Context />

<Themed {themer} color_scheme_fallback={themer.color_scheme}>
	{@render children()}

	{#if main_menu.opened}
		<Dialog onclose={() => main_menu.close()}>
			<Main_Menu />
		</Dialog>
	{/if}
</Themed>

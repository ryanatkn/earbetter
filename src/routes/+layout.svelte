<script lang="ts">
	import '@ryanatkn/moss/style.css';
	import '@ryanatkn/moss/theme.css';
	import '$lib/style.css';

	import Themed from '@ryanatkn/fuz/Themed.svelte';
	import {is_editable, swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import {computed, effect as preact_effect, signal, untracked} from '@preact/signals-core';
	import {sync_color_scheme, Themer} from '@ryanatkn/fuz/theme.svelte.js';
	import type {Snippet} from 'svelte';
	import {page} from '$app/stores';
	import {BROWSER} from 'esm-env';

	import {set_audio_context} from '$lib/audio_context.js';
	import {adjust_volume, set_instrument, set_volume} from '$lib/audio_helpers.js';
	import {request_access} from '$lib/midi_access.js';
	import {App, set_app} from '$lib/earbetter/app.js';
	import {set_enabled_notes, set_key, set_scale, to_notes_in_scale} from '$lib/music.js';
	import {load_from_storage, set_in_storage} from '$lib/storage.js';
	import {Site_Data} from '$routes/site_data.js';
	import Init_Audio_Context from '$lib/Init_Audio_Context.svelte';
	import Main_Menu from '$routes/Main_Menu.svelte';
	import {set_main_menu} from '$routes/main_menu_state.svelte.js';
	import {Level_Hash_Data} from '$lib/earbetter/level.js';
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

	const get_audio_context = set_audio_context();
	const volume = set_volume(signal(initial_site_data.volume));
	const instrument = set_instrument(signal(initial_site_data.instrument));
	const scale = set_scale(signal(initial_site_data.scale));
	const key = set_key(signal(initial_site_data.key));
	set_enabled_notes(
		computed(() =>
			scale.value.name === 'chromatic' ? null : to_notes_in_scale(scale.value, key.value),
		),
	);

	const app = set_app(new App(get_audio_context, volume, instrument));
	if (BROWSER) (window as any).app = app;

	const main_menu = set_main_menu();

	const current_level_hash_data = $derived.by(() => {
		const parsed = Level_Hash_Data.safeParse(parse_from_hash($page.url.hash));
		return parsed.success ? parsed.data : null;
	});
	$effect(() => {
		app.set_active_level_data(current_level_hash_data?.level ?? null);
	});

	// save site data
	const to_site_data = (): Site_Data => ({
		// note these have to use `.value`, the `$`-prefix doesn't work for reactivity
		volume: volume.value,
		instrument: instrument.value,
		scale: scale.value,
		key: key.value,
	});

	preact_effect(() => set_in_storage(SITE_DATA_STORAGE_KEY, to_site_data()));

	// TODO hacky but lets us avoid saving on init, what's a cleaner pattern? doesn't make sense to put in `app`
	let inited_save = false;
	preact_effect(() => {
		if (untracked(() => inited_save)) {
			app.save();
		} else {
			inited_save = true;
		}
	}); // TODO do effects like this need to be cleaned up or is calling dispose only for special cases?

	// TODO refactor
	const keydown = (e: KeyboardEvent) => {
		if (is_editable(e.target) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			return;
		}
		switch (e.key) {
			case 'c': {
				swallow(e);
				void request_access();
				return;
			}
			case '1': {
				swallow(e);
				instrument.value = 'sawtooth';
				return;
			}
			case '2': {
				swallow(e);
				instrument.value = 'sine';
				return;
			}
			case '3': {
				swallow(e);
				instrument.value = 'square';
				return;
			}
			case '4': {
				swallow(e);
				instrument.value = 'triangle';
				return;
			}
			case 'ArrowUp': {
				swallow(e);
				adjust_volume(volume);
				return;
			}
			case 'ArrowDown': {
				swallow(e);
				adjust_volume(volume, -1);
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

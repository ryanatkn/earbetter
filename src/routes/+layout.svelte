<script lang="ts">
	import '@ryanatkn/moss/style.css';
	import '@ryanatkn/moss/theme.css';
	import '$lib/style.css';

	import Themed from '@ryanatkn/fuz/Themed.svelte';
	import {base} from '$app/paths';
	import {is_editable, swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import {slide} from 'svelte/transition';
	import {browser} from '$app/environment';
	import {computed, effect, signal} from '@preact/signals-core';
	import {afterNavigate} from '$app/navigation';
	import {sync_color_scheme} from '@ryanatkn/fuz/theme.js';
	import {writable} from 'svelte/store';
	import type {Snippet} from 'svelte';

	import {set_audio_context} from '$lib/audio_context.js';
	import {adjust_volume, set_instrument, set_volume} from '$lib/helpers.js';
	import {request_access} from '$lib/midi_access.js';
	import {App, set_app} from '$lib/earbetter/app.js';
	import {set_enabled_notes, set_key, set_scale, to_notes_in_scale} from '$lib/music.js';
	import {load_from_storage, set_in_storage} from '$lib/storage.js';
	import Site_Map from '$routes/Site_Map.svelte';
	import {Site_Data} from '$routes/site_data.js';
	import Volume_Control from '$lib/Volume_Control.svelte';
	import Instrument_Control from '$lib/Instrument_Control.svelte';
	import Init_Midi_Button from '$lib/Init_Midi_Button.svelte';
	import Footer from '$routes/Footer.svelte';
	import Site_Breadcrumb from '$routes/Site_Breadcrumb.svelte';
	import Init_Audio_Context from '$lib/Init_Audio_Context.svelte';

	interface Props {
		children: Snippet;
	}

	const {children}: Props = $props();

	const selected_color_scheme = writable('dark' as const);
	sync_color_scheme($selected_color_scheme); // TODO probably shouldn't be needed

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

	// save site data
	const to_site_data = (): Site_Data => ({
		// note these have to use `.value`, the `$`-prefix doesn't work for reactivity
		volume: volume.value,
		instrument: instrument.value,
		scale: scale.value,
		key: key.value,
	});
	const save_site_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_site_data());
	effect(save_site_data);

	const app = set_app(new App(get_audio_context));
	if (browser) (window as any).app = app;

	// TODO add to app? context? global store?
	let show_main_menu = $state(false);
	afterNavigate(() => (show_main_menu = false));

	// TODO refactor
	const keydown = (e: KeyboardEvent) => {
		if (is_editable(e.target)) return;
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
				if (!show_main_menu && document.getElementsByClassName('dialog').length) return;
				swallow(e);
				show_main_menu = !show_main_menu;
				return;
			}
		}
	};

	let deleting = $state(false);
</script>

<svelte:head>
	<title>Earbetter</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<svelte:window onkeydown={keydown} />

<Init_Audio_Context />

<Themed {selected_color_scheme} color_scheme_fallback={$selected_color_scheme}>
	{@render children()}

	{#if show_main_menu}
		<Dialog onclose={() => (show_main_menu = false)}>
			<div class="bg">
				<section>
					<!-- TODO when `.flex_direction_column` or equivalent is added to Moss, change `.box` to that -->
					<div class="section_title box">
						<h1 class="mb_md">earbetter</h1>
						<!-- TODO switch to `class="size_xl"` when Fuz changes to use vb/vi -->
						<div style:--size="var(--size_xl)"><Site_Breadcrumb /></div>
					</div>
					<div class="section_body text_align_center">
						<p>ear training tools and JS/Svelte library for audio and music</p>
					</div>
				</section>
				<section class="box">
					<h2 class="section_title">settings</h2>
					<form class="section_body">
						<Volume_Control {volume} />
						<Instrument_Control {instrument} />
						<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
						<Init_Midi_Button />
					</form>
				</section>
				<section>
					<Site_Map />
				</section>
				<section class="box">
					<h2 class="section_title">data</h2>
					<div class="section_body">
						<p>
							Data is saved locally on your computer using <a
								href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
								><code>localStorage</code></a
							>.
						</p>
						<!-- TODO add an `export saved data` button -->
						<button class="w_100" onclick={() => (deleting = !deleting)}> clear saved data </button>
						{#if deleting}
							<div transition:slide|local>
								<button
									onclick={() => {
										localStorage.clear();
										location.reload();
									}}
								>
									✕ permanently delete all locally saved data
								</button>
							</div>
						{/if}
					</div>
				</section>
				<section class="box">
					<h2 class="section_title">privacy</h2>
					<p class="section_body">
						This website collects no data - the only server it talks to is <a
							href="https://pages.github.com/">GitHub Pages</a
						>
						to serve static files. See
						<a href="https://github.com/ryanatkn/earbetter">the source code</a> for more.
					</p>
				</section>
				<div class="section_title">
					<Footer />
				</div>
			</div>
		</Dialog>
	{/if}
</Themed>

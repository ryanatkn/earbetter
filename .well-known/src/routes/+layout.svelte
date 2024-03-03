<script lang="ts">
	import '@ryanatkn/fuz/style.css';
	import '@ryanatkn/fuz/theme.css';
	import '@ryanatkn/fuz/semantic_classes.css';
	import '@ryanatkn/fuz/utility_classes.css';
	import '@ryanatkn/fuz/variable_classes.css';
	import '@ryanatkn/fuz/animations.css';
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

	const selected_color_scheme = writable('dark' as const);
	sync_color_scheme($selected_color_scheme); // TODO probably shouldn't be needed

	import {set_ac} from '$lib/ac';
	import {adjust_volume, set_instrument, set_volume} from '$lib/helpers';
	import {request_access} from '$lib/midi_access';
	import {App, set_app} from '$lib/earbetter/app';
	import {set_enabled_notes, set_key, set_scale, to_notes_in_scale} from '$lib/music';
	import {load_from_storage, set_in_storage} from '$lib/storage';
	import SiteMap from '$routes/SiteMap.svelte';
	import {SiteData} from '$routes/site_data';
	import VolumeControl from '$lib/VolumeControl.svelte';
	import InstrumentControl from '$lib/InstrumentControl.svelte';
	import InitMidiButton from '$lib/InitMidiButton.svelte';
	import Footer from '$routes/Footer.svelte';
	import SiteBreadcrumb from '$routes/SiteBreadcrumb.svelte';

	// load site data
	const SITE_DATA_STORAGE_KEY = 'site';
	const initial_site_data = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => SiteData.parse({}),
		SiteData.parse,
	);

	const get_ac = set_ac();
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
	const to_site_data = (): SiteData => ({
		// note these have to use `.value`, the `$`-prefix doesn't work for reactivity
		volume: volume.value,
		instrument: instrument.value,
		scale: scale.value,
		key: key.value,
	});
	const save_site_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_site_data());
	effect(save_site_data);

	const app = set_app(new App(get_ac));
	if (browser) (window as any).app = app;

	// TODO add to app? context? global store?
	let show_main_menu = false;
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

	let deleting = false;
</script>

<svelte:head>
	<title>Earbetter</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<svelte:window on:keydown={keydown} />

<Themed {selected_color_scheme} color_scheme_fallback={$selected_color_scheme}>
	<slot />

	{#if show_main_menu}
		<Dialog on:close={() => (show_main_menu = false)}>
			<div class="bg">
				<section class="prose">
					<h1 class="section-title box">
						earbetter <div class="breadcrumbs-wrapper"><SiteBreadcrumb /></div>
					</h1>
					<h2 class="section-title">settings</h2>
					<form class="width_sm box px_md">
						<VolumeControl {volume} />
						<InstrumentControl {instrument} />
						<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
						<InitMidiButton />
					</form>
				</section>
				<section>
					<SiteMap />
				</section>
				<section class="box width_sm">
					<div class="prose">
						<h2 class="section-title">data</h2>
						<div class="px_md">
							<aside>
								<a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
									><code>localStorage</code></a
								> is used to save your data locally on your computer
							</aside>
						</div>
					</div>
					<button on:click={() => (deleting = !deleting)}> clear saved data </button>
					{#if deleting}
						<div transition:slide|local>
							<button
								on:click={() => {
									localStorage.clear();
									location.reload();
								}}
							>
								✕ permanently delete all locally saved data
							</button>
						</div>
					{/if}
				</section>
				<section class="box prose width_sm">
					<h2 class="section-title">privacy</h2>
					<p class="p_md">
						this website collects no data - the only server it talks to is <a
							href="https://pages.github.com/">GitHub Pages</a
						>
						to serve static files, see
						<a href="https://github.com/ryanatkn/earbetter">the source code</a> for more
					</p>
				</section>
				<Footer flush={true} />
			</div>
		</Dialog>
	{/if}
</Themed>

<style>
	.breadcrumbs-wrapper {
		font-size: var(--size_md);
	}
</style>

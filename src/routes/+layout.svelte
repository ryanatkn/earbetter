<script lang="ts">
	import '@feltjs/felt-ui/style.css';
	import '$routes/style.css';

	import {base} from '$app/paths';
	import {isEditable, swallow} from '@feltjs/util/dom.js';
	import Dialog from '@feltjs/felt-ui/Dialog.svelte';
	import {slide} from 'svelte/transition';
	import {browser} from '$app/environment';
	import {computed, effect, signal} from '@preact/signals-core';
	import {afterNavigate} from '$app/navigation';

	import {set_ac} from '$lib/audio/ac';
	import {adjust_volume, set_instrument, set_volume} from '$lib/audio/helpers';
	import {request_access} from '$lib/audio/midi_access';
	import {App, set_app} from '$lib/earbetter/app';
	import {set_enabled_notes, set_key, set_scale, to_notes} from '$lib/music/music';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';
	import SiteMap from '$routes/SiteMap.svelte';
	import {SiteData} from '$routes/site_data';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import Footer from '$routes/Footer.svelte';

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
		computed(() => (scale.value.name === 'chromatic' ? null : to_notes(scale.value, key.value))),
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

	const keydown = (e: KeyboardEvent) => {
		if (isEditable(e.target)) return;
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
<slot />

{#if show_main_menu}
	<Dialog on:close={() => (show_main_menu = false)}>
		<section class="markup">
			<h1 class="section-title">earbetter</h1>
			<h2 class="section-title">settings</h2>
			<form class="column-sm centered">
				<VolumeControl {volume} />
				<InstrumentControl {instrument} />
				<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
				<InitMidiButton />
			</form>
		</section>
		<section>
			<SiteMap />
		</section>
		<section class="centered">
			<h2 class="section-title">data</h2>
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
		<Footer flush={true} />
	</Dialog>
{/if}

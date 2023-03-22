<script lang="ts">
	import '@feltjs/felt-ui/style.css';
	import {base} from '$app/paths';
	import {isEditable, swallow} from '@feltjs/util/dom.js';
	import Dialog from '@feltjs/felt-ui/Dialog.svelte';

	import '$routes/style.css';
	import {set_audio_ctx} from '$lib/audio/audio_ctx';
	import {adjust_volume, set_instrument, set_volume} from '$lib/audio/helpers';
	import {request_access} from '$lib/audio/midi_access';
	import {App, set_app} from '$lib/earbetter/app';
	import WebsiteMap from '$routes/WebsiteMap.svelte';
	import {afterNavigate} from '$app/navigation';

	const get_ac = set_audio_ctx();
	const volume = set_volume();
	const instrument = set_instrument();

	const app = new App(get_ac);
	set_app(app);

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
				swallow(e);
				show_main_menu = !show_main_menu;
				return;
			}
		}
	};
</script>

<svelte:head>
	<title>earbetter</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<svelte:window on:keydown={keydown} />
<slot />

{#if show_main_menu}
	<Dialog on:close={() => (show_main_menu = false)}>
		<div style:padding-bottom="var(--spacing_md)">
			<WebsiteMap><h2>earbetter</h2></WebsiteMap>
		</div>
	</Dialog>
{/if}

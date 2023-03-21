<script lang="ts">
	import '@feltjs/felt-ui/style.css';
	import {base} from '$app/paths';
	import {isEditable, swallow} from '@feltjs/util/dom.js';

	import '$routes/style.css';
	import {set_audio_ctx} from '$lib/audio/audio_ctx';
	import {adjust_volume, set_instrument, set_volume} from '$lib/audio/helpers';
	import {request_access} from '$lib/audio/midi_access';

	set_audio_ctx();
	const volume = set_volume();
	const instrument = set_instrument();

	const keydown = (e: KeyboardEvent) => {
		console.log(`e.key`, e.key);
		if (isEditable(e.target)) return;
		switch (e.key) {
			case 'c': {
				swallow(e);
				void request_access();
				return;
			}
			case '1': {
				swallow(e);
				$instrument = 'sawtooth';
				return;
			}
			case '2': {
				swallow(e);
				$instrument = 'sine';
				return;
			}
			case '3': {
				swallow(e);
				$instrument = 'square';
				return;
			}
			case '4': {
				swallow(e);
				$instrument = 'triangle';
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
		}
	};
</script>

<svelte:head>
	<title>earbetter</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<svelte:window on:keydown={keydown} />
<slot />

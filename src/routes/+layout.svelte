<script lang="ts">
	import '@feltjs/felt-ui/style.css';
	import {base} from '$app/paths';

	import './style.css';
	import {set_audio_ctx} from '$lib/audio/audio_ctx';
	import {set_volume} from '$lib/audio/helpers';

	set_audio_ctx();
	set_volume();
</script>

<svelte:head>
	<title>@ryanatkn/earworm</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<slot />

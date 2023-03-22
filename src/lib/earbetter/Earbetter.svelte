<script lang="ts">
	import LevelMap from '$lib/earbetter/LevelMap.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import {midi_access} from '$lib/audio/midi_access';
	import type {App} from '$lib/earbetter/app';

	export let app: App;

	$: ({active_level_def, exit_level_to_map} = app);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;
</script>

{#if $active_level_def}
	<div class="level">
		<Level level_def={$active_level_def} {exit_level_to_map} />
	</div>
{:else}
	<slot name="header" />
	<LevelMap {app} {midi_access} />
	<slot name="footer" />
{/if}

<style>
	:global(html, body) {
		width: 100%;
		height: 100%;
	}

	.level {
		width: 100%;
		height: 100%;
	}
</style>

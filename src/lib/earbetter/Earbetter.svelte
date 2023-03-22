<script lang="ts">
	import LevelMap from '$lib/earbetter/LevelMap.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import {midi_access} from '$lib/audio/midi_access';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		level_defs,
		active_level_def,
		level_stats,
		exit_level_to_map,
		editing_level_def,
		play_level_def,
		edit_level_def,
		remove_level_def,
		create_level_def,
		update_level_def,
	} = app);
	$: ({stats} = level_stats);
	$: console.log('stats', $stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;
</script>

{#if $active_level_def}
	<div class="level">
		<Level level_def={$active_level_def} {exit_level_to_map} />
	</div>
{:else}
	<slot name="header" />
	<LevelMap
		{midi_access}
		level_def={$editing_level_def}
		level_defs={$level_defs}
		{level_stats}
		{play_level_def}
		{edit_level_def}
		{remove_level_def}
		{create_level_def}
		{update_level_def}
	/>
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

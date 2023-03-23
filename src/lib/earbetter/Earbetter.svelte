<script lang="ts">
	import LevelMap from '$lib/earbetter/LevelMap.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import {get_ac} from '$lib/audio/ac';
	import {midi_access} from '$lib/audio/midi_access';
	import type {App} from '$lib/earbetter/app';

	export let app: App;

	$: ({active_level_def, exit_level_to_map} = app);

	const ac = get_ac();
	(window as any).audio = ac;
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

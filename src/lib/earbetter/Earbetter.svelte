<script lang="ts">
	import {onDestroy} from 'svelte';

	import LevelMap from '$lib/earbetter/LevelMap.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import type {Level as LevelType} from '$lib/earbetter/level';
	import {get_ac} from '$lib/audio/ac';
	import {midi_access} from '$lib/audio/midi_access';
	import type {App} from '$lib/earbetter/app';

	export let app: App;

	$: ({active_level_def, exit_level_to_map, register_success} = app);

	const ac = get_ac();
	(window as any).audio = ac;

	// TODO this is hacky because of how `Level.svelte` instantiates the `level` instance, see in multiple places
	let level: LevelType; // TODO resolve ambiguity
	$: if (level) app.level.value = level;
	onDestroy(() => {
		if (level && level === app.level.peek()) app.level.value = null;
	});
</script>

{#if $active_level_def}
	<div class="level">
		<Level level_def={$active_level_def} {exit_level_to_map} {register_success} bind:level />
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

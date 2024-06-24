<script lang="ts">
	import {onDestroy, type Snippet} from 'svelte';

	import Level_Map from '$lib/earbetter/Level_Map.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import type {Level as LevelType} from '$lib/earbetter/level.js';
	import {get_ac} from '$lib/ac.js';
	import {midi_access} from '$lib/midi_access.js';
	import type {App} from '$lib/earbetter/app.js';

	interface Props {
		app: App;
		header?: Snippet;
		footer?: Snippet;
	}

	const {app, header, footer}: Props = $props();

	const {active_level_data, exit_level_to_map, register_success, selected_project_data} =
		$derived(app);

	const ac = get_ac();
	(window as any).audio = ac;

	// TODO this is hacky because of how `Level.svelte` instantiates the `level` instance, see in multiple places
	let level: LevelType | undefined = $state(); // TODO resolve ambiguity
	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => {
		if (level) app.level.value = level;
	});
	onDestroy(() => {
		if (level && level === app.level.peek()) app.level.value = null;
	});

	const level_stats = $derived($selected_project_data?.level_stats);
</script>

{#if $active_level_data && level_stats}
	<div class="level">
		<Level
			level_data={$active_level_data}
			{level_stats}
			{exit_level_to_map}
			{register_success}
			bind:level
		/>
	</div>
{:else}
	{#if header}{@render header()}{/if}
	<Level_Map {app} {midi_access} />
	{#if footer}{@render footer()}{/if}
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

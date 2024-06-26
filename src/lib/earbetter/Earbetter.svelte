<script lang="ts">
	import {onDestroy} from 'svelte';

	import Level_Map from '$lib/earbetter/Level_Map.svelte';
	import Level from '$lib/earbetter/Level.svelte';
	import {get_audio_context} from '$lib/audio_context.js';
	import {midi_access} from '$lib/midi_access.js';
	import type {App} from '$lib/earbetter/app.js';
	import {create_level} from '$lib/earbetter/level.js';
	import {get_instrument, get_volume} from '$lib/helpers.js';

	interface Props {
		app: App;
	}

	const {app}: Props = $props();

	const {active_level_data, exit_level_to_map, register_success, selected_project_data} =
		$derived(app);

	const ac = get_audio_context();
	(window as any).ac = ac;

	const volume = get_volume();
	const instrument = get_instrument();

	// TODO this is hacky because of how `Level.svelte` instantiates the `level` instance, see in multiple places
	const level = $derived(
		$active_level_data ? create_level($active_level_data, ac, volume, instrument) : null,
	);
	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => {
		if (level) app.level.value = level;
	});
	onDestroy(() => {
		if (level && level === app.level.peek()) app.level.value = null;
	});

	const level_stats = $derived($selected_project_data?.level_stats);
</script>

{#if level && level_stats}
	<div class="level">
		<Level {level} {level_stats} {exit_level_to_map} {register_success} />
	</div>
{:else}
	<Level_Map {app} {midi_access} />
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

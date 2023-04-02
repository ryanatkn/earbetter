<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelDef} from '$lib/earbetter/level';
	import type {App} from '$lib/earbetter/app';
	import LevelStatsSummary from '$lib/earbetter/LevelStatsSummary.svelte';

	export let app: App;
	export let level_def: LevelDef;

	$: ({
		editing_level,
		editing_level_def,
		selected_project_data,
		play_level,
		edit_level,
		remove_level,
	} = app);

	// TODO hacky - the `editing_this_def` is needed when clicking into a level and going back,
	// the `editing_level_def` is set but `editing_level` may be false,
	// and we need to show it selected but not the edit button (needs restructuring for a proper fix)
	$: editing_this_def = $editing_level_def === level_def;
	$: editing = $editing_level && editing_this_def;
	$: level_stats = $selected_project_data?.level_stats;

	let removing = false;
</script>

<li class="level-map-item" transition:slide|local>
	{#if level_stats}
		<LevelStatsSummary {level_def} {level_stats} />
	{/if}
	<button
		class="level-button deselectable"
		title="play this level"
		on:click={() => play_level(level_def.id)}
		class:selected={editing || editing_this_def}
	>
		{level_def.name}
	</button>
	<button
		class="icon-button plain-button"
		class:selected={!removing && editing}
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		on:click={() =>
			removing ? remove_level(level_def.id) : edit_level(editing ? null : level_def)}
	>
		{#if removing}✖{:else}✎{/if}
	</button>
	<button
		class="icon-button plain-button"
		on:click={() => (removing = !removing)}
		title={removing ? 'cancel removing' : 'remove level'}
	>
		{#if removing}×{:else}✕{/if}
	</button>
</li>

<style>
	.plain-button:not(.selected) {
		visibility: hidden;
	}
	.level-map-item:hover .plain-button {
		visibility: visible;
	}
	.level-button {
		flex: 1;
	}
	.icon-button {
		font-size: var(--font_size_xl);
	}
</style>

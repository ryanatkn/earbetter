<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelData} from '$lib/earbetter/level';
	import type {App} from '$lib/earbetter/app';
	import LevelStatsSummary from '$lib/earbetter/LevelStatsSummary.svelte';

	export let app: App;
	export let level_data: LevelData;

	$: ({
		editing_level,
		editing_level_data,
		selected_project_data,
		play_level,
		edit_level,
		remove_level,
	} = app);

	// TODO hacky - the `editing_this_level` is needed when clicking into a level and going back,
	// the `editing_level_data` is set but `editing_level` may be false,
	// and we need to show it selected but not the edit button (needs restructuring for a proper fix)
	$: editing_this_level = $editing_level_data === level_data;
	$: editing = $editing_level && editing_this_level;
	$: level_stats = $selected_project_data?.level_stats;

	let removing = false;
</script>

<li class="level-map-item" transition:slide|local>
	{#if level_stats}
		<LevelStatsSummary {level_data} {level_stats} />
	{/if}
	<button
		class="level-button deselectable"
		title="play this level"
		on:click={() => play_level(level_data.id)}
		class:selected={editing || editing_this_level}
	>
		{level_data.name}
	</button>
	<button
		class="icon-button plain-button"
		class:selected={!removing && editing}
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		on:click={() =>
			removing ? remove_level(level_data.id) : edit_level(editing ? null : level_data)}
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

<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelData} from '$lib/earbetter/level';
	import type {App} from '$lib/earbetter/app.js';
	import LevelStatsSummary from '$lib/earbetter/LevelStatsSummary.svelte';

	export let app: App;
	export let level_data: LevelData;

	$: ({
		editing_level,
		draft_level_data,
		selected_project_data,
		play_level,
		edit_level,
		remove_level,
	} = app);

	// TODO hacky - the `editing_this_level` is needed when clicking into a level and going back,
	// the `draft_level_data` is set but `editing_level` may be false,
	// and we need to show it selected but not the edit button (needs restructuring for a proper fix)
	$: editing_this_level = $draft_level_data === level_data;
	$: editing = $editing_level && editing_this_level;
	$: level_stats = $selected_project_data?.level_stats;

	let removing = false;

	$: selected = editing || editing_this_level;
</script>

<li class="level_map_item" transition:slide|local class:selected>
	{#if level_stats}
		<LevelStatsSummary {level_data} {level_stats} />
	{/if}
	<button
		class="level_button deselectable"
		title="play this level"
		onclick={() => play_level(level_data.id)}
		class:selected
	>
		{level_data.name}
	</button>
	<button
		class="icon_button plain_button"
		class:selected={!removing && editing}
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		onclick={() =>
			removing ? remove_level(level_data.id) : edit_level(editing ? null : level_data)}
	>
		{#if removing}✖{:else}✎{/if}
	</button>
	<button
		class="icon_button plain_button"
		onclick={() => (removing = !removing)}
		title={removing ? 'cancel removing' : 'remove level'}
	>
		{#if removing}×{:else}✕{/if}
	</button>
</li>

<style>
	.level_map_item {
		display: flex;
	}
	.plain_button:not(.selected) {
		visibility: hidden;
	}
	.level_map_item:hover .plain_button,
	li.selected .plain_button {
		visibility: visible;
	}
	.level_button {
		flex: 1;
	}
	.icon_button {
		font-size: var(--size_xl);
		width: var(--icon_button_width, 60px);
	}
</style>

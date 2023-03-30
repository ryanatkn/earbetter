<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelDef} from '$lib/earbetter/level';
	import type {App} from '$lib/earbetter/app';
	import LevelStatsSummary from '$lib/earbetter/LevelStatsSummary.svelte';

	export let app: App;
	export let level_def: LevelDef;

	$: ({editing_level_def, selected_project_def, play_level, edit_level, remove_level} = app);

	$: editing = $editing_level_def === level_def;
	$: level_stats = $selected_project_def?.level_stats;

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
		class:selected={editing}
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

<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelDef} from '$lib/earbetter/level';
	import type {App} from '$lib/earbetter/app';
	import LevelStats from '$lib/earbetter/LevelStats.svelte';

	export let app: App;
	export let level_def: LevelDef;

	$: ({editing_level_def, editing_project_def, play_level_def, edit_level_def, remove_level_def} =
		app);

	$: editing = $editing_level_def === level_def;
	$: stats = $editing_project_def?.stats;

	let removing = false;
</script>

<li class="level-map-item" transition:slide|local>
	{#if stats}
		<LevelStats {level_def} {stats} />
	{/if}
	<button
		class="level-button deselectable"
		on:click={() => play_level_def(level_def.id)}
		class:selected={editing}
	>
		{level_def.name}
	</button>
	<button
		class="icon-button plain-button"
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		on:click={() =>
			removing ? remove_level_def(level_def.id) : edit_level_def(editing ? null : level_def)}
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
	.plain-button {
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

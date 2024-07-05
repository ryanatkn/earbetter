<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {Level_Data} from '$lib/earbetter/level.js';
	import type {App} from '$lib/earbetter/app.js';
	import Level_Stats_Summary from '$lib/earbetter/Level_Stats_Summary.svelte';

	interface Props {
		app: App;
		level_data: Level_Data;
	}

	const {app, level_data}: Props = $props();

	const {
		editing_level,
		draft_level_data,
		selected_project_data,
		play_level,
		edit_level,
		remove_level,
	} = $derived(app);

	// TODO hacky - the `editing_this_level` is needed when clicking into a level and going back,
	// the `draft_level_data` is set but `editing_level` may be false,
	// and we need to show it selected but not the edit button (needs restructuring for a proper fix)
	const editing_this_level = $derived($draft_level_data === level_data);
	const editing = $derived($editing_level && editing_this_level);
	const level_stats = $derived($selected_project_data?.level_stats);

	let removing = $state(false);

	const selected = $derived(editing || editing_this_level);
</script>

<li class="level_map_item" transition:slide class:selected>
	{#if level_stats}
		<Level_Stats_Summary {level_data} {level_stats} />
	{/if}
	<button
		type="button"
		class="level_button deselectable"
		title="play this level"
		onclick={() => play_level(level_data.id)}
		class:selected
	>
		{level_data.name}
	</button>
	<button
		type="button"
		class="icon_button plain_button size_xl"
		class:selected={!removing && editing}
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		onclick={() =>
			removing ? remove_level(level_data.id) : edit_level(editing ? null : level_data)}
	>
		{#if removing}✖{:else}✎{/if}
	</button>
	<button
		type="button"
		class="icon_button plain_button size_xl"
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
</style>

<script lang="ts">
	import {slide} from 'svelte/transition';
	import {tick} from 'svelte';

	import type {Level_Data} from '$lib/earbetter/level.svelte.js';
	import type {App} from '$lib/earbetter/app.svelte.js';
	import Level_Stats_Summary from '$lib/earbetter/Level_Stats_Summary.svelte';

	interface Props {
		app: App;
		level_data: Level_Data;
	}

	const {app, level_data}: Props = $props();

	// TODO hacky - the `editing_this_level` is needed when clicking into a level and going back,
	// the `draft_level_data` is set but `editing_level` may be false,
	// and we need to show it selected but not the edit button (needs restructuring for a proper fix)
	const editing_this_level = $derived(app.draft_level_data === level_data);
	const editing = $derived(app.editing_level && editing_this_level);
	const level_stats = $derived(app.selected_project_data?.level_stats);

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
		onclick={() => app.play_level(level_data.id)}
		class:selected
	>
		{level_data.name}
	</button>
	<button
		type="button"
		class="icon_button plain_button font_size_xl"
		class:selected={!removing && editing}
		class:color_c={removing}
		title={removing ? 'remove level' : editing ? 'stop editing level' : 'edit level'}
		onclick={async () => {
			if (removing) {
				app.remove_level(level_data.id);
			} else {
				const opening = !editing;
				app.edit_level(opening ? level_data : null);
				if (opening) {
					await tick();
					const el = document.querySelector('.level_def_form');
					el?.scrollIntoView({behavior: 'smooth', block: 'center'});
				}
			}
		}}
	>
		{#if removing}✕{:else}✎{/if}
	</button>
	<button
		type="button"
		class="icon_button plain_button font_size_xl"
		onclick={() => (removing = !removing)}
		title={removing ? 'cancel removing' : 'remove level'}
	>
		{#if removing}×{:else}✕{/if}
	</button>
</li>

<style>
	.level_map_item {
		display: flex;
		align-items: center;
		margin-bottom: var(--space_md);
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

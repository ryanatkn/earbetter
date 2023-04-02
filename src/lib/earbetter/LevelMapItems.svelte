<script lang="ts">
	import LevelMapItem from '$lib/earbetter/LevelMapItem.svelte';
	import type {App} from '$lib/earbetter/app';
	import {LevelData} from '$lib/earbetter/level';

	export let app: App;
	export let levels: LevelData[]; // TODO making this a prop here, but using `app` most places, maybe change it to context?

	$: ({selected_realm_data, editing_level, editing_level_data, edit_level} = app);

	$: editing_draft = $editing_level && !levels.some((d) => d === $editing_level_data);

	$: no_levels = !levels.length;

	$: console.log(`levels`, levels);

	const click_create_new = () => {
		if (no_levels) {
			(document.querySelector('.level-def-form input') as HTMLInputElement | null)?.focus?.();
		} else {
			edit_level(editing_draft ? null : LevelData.parse({}));
		}
	};
</script>

<div class="panel padded-md">
	<div class="markup">
		<header>
			<h2>{$selected_realm_data?.name}</h2>
		</header>
	</div>
	<menu class="levels">
		{#each levels as d (d.id)}
			<LevelMapItem {app} level_data={d} />
		{/each}
	</menu>
	<button
		class:selected={editing_draft || no_levels}
		class:deselectable={!no_levels}
		on:click={click_create_new}
	>
		create a new level
	</button>
</div>

<style>
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin-bottom: var(--spacing_md);
	}
	button {
		width: 100%;
	}
</style>

<script lang="ts">
	import LevelMapItem from '$lib/earbetter/LevelMapItem.svelte';
	import type {App} from '$lib/earbetter/app';
	import type {LevelDef} from '$lib/earbetter/level';
	import {create_level_def} from '$lib/earbetter/level';

	export let app: App;
	export let level_defs: LevelDef[]; // TODO making this a prop here, but using `app` most places, maybe change it to context?

	$: ({selected_realm_def, editing_level, editing_level_def, edit_level_def} = app);

	$: editing_draft = $editing_level && !level_defs.some((d) => d === $editing_level_def);

	$: no_levels = !level_defs.length;

	$: console.log(`level_defs`, level_defs);
</script>

<section class="panel padded-md">
	<div class="markup">
		<header>
			<h2>{$selected_realm_def?.name}</h2>
		</header>
	</div>
	<menu class="levels">
		{#each level_defs as d (d.id)}
			<LevelMapItem {app} level_def={d} />
		{/each}
	</menu>
	<button
		class:selected={editing_draft || no_levels}
		class:deselectable={!no_levels}
		on:click={() => edit_level_def(editing_draft ? null : create_level_def())}
	>
		create a new level
	</button>
</section>

<style>
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin-bottom: var(--spacing_md);
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	section:not(:first-child) {
		margin: var(--spacing_xl5) 0;
	}
	button {
		width: 100%;
	}
</style>

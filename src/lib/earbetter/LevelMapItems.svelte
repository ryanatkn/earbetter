<script lang="ts">
	import LevelMapItem from '$lib/earbetter/LevelMapItem.svelte';
	import type {App} from '$lib/earbetter/app';
	import type {LevelDef} from '$lib/earbetter/level';

	export let app: App;
	export let level_defs: LevelDef[]; // TODO making this a prop here, but using `app` most places, maybe change it to context?

	$: ({selected_realm_def} = app);

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
</section>

<style>
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin: var(--spacing_md) 0;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	section:not(:first-child) {
		margin: var(--spacing_xl5) 0;
	}
</style>

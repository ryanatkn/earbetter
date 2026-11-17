<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import LevelMapItem from './LevelMapItem.svelte';
	import type { App } from './app.svelte.ts';
	import { LevelData } from './level.svelte.ts';

	interface Props {
		app: App;
		levels: Array<LevelData>; // TODO making this a prop here, but using `app` most places, maybe change it to context?
	}

	const { app, levels }: Props = $props();

	const editing_draft = $derived(
		app.editing_level && !levels.some((d) => d === app.draft_level_data)
	);

	const no_levels = $derived(!levels.length);

	const click_create_new = () => {
		if (no_levels) {
			// TODO eslint bug
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(document.querySelector('.level_def_form input') as HTMLInputElement | null)?.focus(); // TODO hacky using the selector
		} else {
			app.edit_level(editing_draft ? null : s.parse_or_throw(LevelData, {}));
		}
	};
</script>

<div class="panel p_md">
	<header>
		<h2 class="my_0">levels</h2>
		<h3 class="my_0">{app.selected_realm_data?.name}</h3>
	</header>
	<menu class="levels unstyled mb_0">
		{#each levels as d (d.id)}
			<LevelMapItem {app} level_data={d} />
		{/each}
	</menu>
	<button
		type="button"
		class:selected={editing_draft || no_levels}
		class:deselectable={!no_levels}
		onclick={click_create_new}
	>
		create a new level
	</button>
</div>

<style>
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
	button {
		width: 100%;
	}
</style>

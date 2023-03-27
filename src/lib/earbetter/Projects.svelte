<script lang="ts">
	import {create_project_def} from '$lib/earbetter/project';
	import ProjectItems from '$lib/earbetter/ProjectItems.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		app_data,
		project_defs,
		selected_project_id,
		editing_project,
		editing_project_id,
		editing_project_def,
		load_project,
		select_project,
		edit_project,
		remove_project,
	} = app);

	$: creating = $editing_project && $selected_project_id !== $editing_project_id;

	$: ({projects} = $app_data);
</script>

<div class="panel padded-md">
	<div class="markup">
		<header>
			<h2>projects</h2>
		</header>
	</div>
	<ProjectItems
		selected_project_id={$selected_project_id}
		editing_project_id={$editing_project ? $editing_project_id : null}
		{projects}
		project_defs={$project_defs}
		{load_project}
		{select_project}
		edit_project={(p) => edit_project(p === $editing_project_def && $editing_project ? null : p)}
		{remove_project}
	/>
	<button
		class="create-new-project deselectable"
		class:selected={creating}
		on:click={() => {
			if (creating) {
				editing_project.value = false;
			} else {
				edit_project(create_project_def());
			}
		}}
	>
		create a new project
	</button>
</div>

<style>
	.create-new-project {
		margin: var(--spacing_md) 0;
		width: 100%;
	}
</style>

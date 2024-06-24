<script lang="ts">
	import {ProjectData} from '$lib/earbetter/project';
	import ProjectItems from '$lib/earbetter/ProjectItems.svelte';
	import type {App} from '$lib/earbetter/app.js';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		app_data,
		project_datas,
		selected_project_id,
		editing_project,
		editing_project_id,
		editing_project_data,
		load_project,
		select_project,
		edit_project,
		remove_project,
	} = app);

	$: creating = $editing_project && $selected_project_id !== $editing_project_id;

	$: ({projects} = $app_data);
</script>

<div class="panel p_md">
	<header>
		<h2>projects</h2>
	</header>
	<ProjectItems
		selected_project_id={$selected_project_id}
		editing_project_id={$editing_project ? $editing_project_id : null}
		{projects}
		project_datas={$project_datas}
		{load_project}
		{select_project}
		edit_project={(p) => edit_project(p === $editing_project_data && $editing_project ? null : p)}
		{remove_project}
	/>
	<button
		class="create-new-project deselectable"
		class:selected={creating}
		onclick={() => {
			if (creating) {
				editing_project.value = false;
			} else {
				edit_project(ProjectData.parse({}));
			}
		}}
	>
		create a new project
	</button>
</div>

<style>
	.create-new-project {
		margin-top: var(--space_md);
		width: 100%;
	}
</style>

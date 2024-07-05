<script lang="ts">
	import {Project_Data} from '$lib/earbetter/project.js';
	import Project_Items from '$lib/earbetter/Project_Items.svelte';
	import type {App} from '$lib/earbetter/app.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {
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
	} = $derived(app);

	const creating = $derived($editing_project && $selected_project_id !== $editing_project_id);

	const {projects} = $derived($app_data);
</script>

<div class="panel p_md">
	<header>
		<h2 class="my_0">projects</h2>
	</header>
	<Project_Items
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
		type="button"
		class="w_100 mt_md deselectable"
		class:selected={creating}
		onclick={() => {
			if (creating) {
				editing_project.value = false;
			} else {
				edit_project(Project_Data.parse({}));
			}
		}}
	>
		create a new project
	</button>
</div>

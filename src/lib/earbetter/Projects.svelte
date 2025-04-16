<script lang="ts">
	import {Project_Data} from '$lib/earbetter/project.js';
	import Project_Items from '$lib/earbetter/Project_Items.svelte';
	import type {App} from '$lib/earbetter/app.svelte.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {load_project, select_project, edit_project, remove_project} = $derived(app);

	const creating = $derived(
		app.editing_project && app.selected_project_id !== app.editing_project_id,
	);

	const {projects} = $derived(app.app_data);
</script>

<div class="panel p_md">
	<header>
		<h2 class="my_0">projects</h2>
	</header>
	<Project_Items
		selected_project_id={app.selected_project_id}
		editing_project_id={app.editing_project ? app.editing_project_id : null}
		{projects}
		project_datas={app.project_datas}
		{load_project}
		{select_project}
		edit_project={(p) =>
			edit_project(p === app.editing_project_data && app.editing_project ? null : p)}
		{remove_project}
	/>
	<button
		type="button"
		class="w_100 mt_md deselectable"
		class:selected={creating}
		onclick={() => {
			if (creating) {
				app.editing_project = false;
			} else {
				edit_project(Project_Data.parse({}));
			}
		}}
	>
		create a new project
	</button>
</div>

<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { ProjectData } from './project.ts';
	import ProjectItems from './ProjectItems.svelte';
	import { app_context } from './app.svelte.ts';

	const app = app_context.get();

	const { load_project, select_project, edit_project, remove_project } = app;

	const creating = $derived(
		app.editing_project && app.selected_project_id !== app.editing_project_id
	);

	const { projects } = $derived(app.app_data);
</script>

<div class="panel p_md">
	<header>
		<h2 class="my_0">projects</h2>
	</header>
	<ProjectItems
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
		class="width:100% mt_md deselectable"
		class:selected={creating}
		onclick={() => {
			if (creating) {
				app.editing_project = false;
			} else {
				edit_project(s.parse_or_throw(ProjectData, {}));
			}
		}}
	>
		create a new project
	</button>
</div>

<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import ProjectForm from './ProjectForm.svelte';
	import { app_context } from './app.svelte.ts';
	import { ProjectData } from './project.ts';

	const app = app_context.get();

	const { remove_project, duplicate_project, update_project, create_project } = app;

	const project_data = $derived(app.editing_project_data ?? s.parse_or_throw(ProjectData, {}));

	const editing = $derived(app.project_datas.some((d) => d.id === project_data.id));
</script>

<div class="panel p_md">
	<ProjectForm
		{editing}
		{project_data}
		onsubmit={editing ? update_project : create_project}
		onremove={remove_project}
		onduplicate={duplicate_project}
		onclose={() => (app.editing_project = false)}
	/>
</div>

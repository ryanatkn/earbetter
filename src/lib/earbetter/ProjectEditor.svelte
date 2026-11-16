<script lang="ts">
	import ProjectForm from '$lib/earbetter/ProjectForm.svelte';
	import type {App} from '$lib/earbetter/app.svelte.js';
	import {ProjectData} from '$lib/earbetter/project.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {remove_project, duplicate_project, update_project, create_project} = $derived(app);

	const project_data = $derived(app.editing_project_data ?? ProjectData.parse({}));

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

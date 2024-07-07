<script lang="ts">
	import Project_Form from '$lib/earbetter/Project_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';
	import {Project_Data} from '$lib/earbetter/project.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {remove_project, duplicate_project, update_project, create_project} = $derived(app);

	const project_data = $derived(app.editing_project_data ?? Project_Data.parse({}));

	const editing = $derived(app.project_datas.some((d) => d.id === project_data.id));
</script>

<div class="panel p_md">
	<Project_Form
		{editing}
		{project_data}
		onsubmit={editing ? update_project : create_project}
		onremove={remove_project}
		onduplicate={duplicate_project}
		onclose={() => (app.editing_project = false)}
	/>
</div>

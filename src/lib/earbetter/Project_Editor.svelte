<script lang="ts">
	import Project_Form from '$lib/earbetter/Project_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';
	import {Project_Data} from '$lib/earbetter/project.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {
		project_datas: projects,
		editing_project,
		editing_project_data,
		remove_project,
		duplicate_project,
		update_project,
		create_project,
	} = $derived(app);

	const project_data = $derived($editing_project_data ?? Project_Data.parse({}));

	const editing = $derived($projects.some((d) => d.id === project_data.id));
</script>

<div class="panel p_md">
	<Project_Form
		{editing}
		{project_data}
		onsubmit={(editing ? update_project : create_project)
			? (project_data) => (editing ? update_project : create_project)?.(project_data)
			: undefined}
		onremove={remove_project ? (project_id) => remove_project?.(project_id) : undefined}
		onduplicate={duplicate_project ? (project_id) => duplicate_project?.(project_id) : undefined}
	>
		{#snippet footer(changed)}
			{#if editing}
				<button type="button" onclick={() => (editing_project.value = false)}>
					{#if changed}discard changes and stop editing{:else}stop editing this project{/if}
				</button>
			{/if}
		{/snippet}
	</Project_Form>
</div>

<script lang="ts">
	import type {Project_Data, Project_Id, Project_Metadata} from '$lib/earbetter/project.js';
	import Project_Item from '$lib/earbetter/Project_Item.svelte';

	interface Props {
		selected_project_id?: Project_Id | null;
		editing_project_id?: Project_Id | null;
		projects?: Project_Metadata[];
		project_datas?: Project_Data[];
		load_project: (id: Project_Id) => Project_Data | null;
		select_project: (id: Project_Id) => void;
		edit_project: (project_data: Project_Data | null) => void;
		remove_project: (id: Project_Id) => void;
	}

	const {
		selected_project_id = null,
		editing_project_id = null,
		projects = [],
		project_datas = [],
		load_project,
		select_project,
		edit_project,
		remove_project,
	}: Props = $props();
</script>

<menu class="unstyled width_sm">
	{#each projects as project (project.id)}
		<Project_Item
			{project}
			project_data={project_datas.find((p) => p.id === project.id)}
			load={load_project}
			select={select_project}
			edit={edit_project}
			remove={remove_project}
			selected={project.id === selected_project_id}
			editing={project.id === editing_project_id}
		/>
	{/each}
</menu>

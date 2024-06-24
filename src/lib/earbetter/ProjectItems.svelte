<script lang="ts">
	import type {Project_Data, Project_Id, ProjectMetadata} from '$lib/earbetter/project.js';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';

	export let selected_project_id: Project_Id | null = null;
	export let editing_project_id: Project_Id | null = null;
	export let projects: ProjectMetadata[] = [];
	export let project_datas: Project_Data[] = [];
	export let load_project: (id: Project_Id) => Project_Data | null;
	export let select_project: (id: Project_Id) => void;
	export let edit_project: (project_data: Project_Data | null) => void;
	export let remove_project: (id: Project_Id) => void;
</script>

<menu class="projects width_sm">
	{#each projects as project (project.id)}
		<ProjectItem
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

<script lang="ts">
	import type {ProjectData, ProjectId, ProjectMetadata} from '$lib/earbetter/project';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';

	export let selected_project_id: ProjectId | null = null;
	export let editing_project_id: ProjectId | null = null;
	export let projects: ProjectMetadata[] = [];
	export let project_datas: ProjectData[] = [];
	export let load_project: (id: ProjectId) => ProjectData | null;
	export let select_project: (id: ProjectId) => void;
	export let edit_project: (project_data: ProjectData | null) => void;
	export let remove_project: (id: ProjectId) => void;
</script>

<menu class="projects column-sm">
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

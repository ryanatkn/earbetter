<script lang="ts">
	import type {ProjectDef, ProjectId, ProjectMetadata} from '$lib/earbetter/project';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';

	export let selected_project_def: ProjectDef | null = null;
	export let projects: ProjectMetadata[] = [];
	export let project_defs: ProjectDef[] = [];
	export let load_project: (id: ProjectId) => ProjectDef | null;
	export let select_project: (id: ProjectId) => void;
	export let edit_project: (project_def: ProjectDef | null) => void;
	export let remove_project: (id: ProjectId) => void;
</script>

<menu class="projects column-sm">
	{#each projects as project (project.id)}
		<ProjectItem
			{project}
			project_def={project_defs.find((p) => p.id === project.id)}
			load={load_project}
			select={select_project}
			edit={edit_project}
			remove={remove_project}
			selected={project.id === selected_project_def?.id}
		/>
	{/each}
</menu>

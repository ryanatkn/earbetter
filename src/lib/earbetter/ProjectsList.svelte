<script lang="ts">
	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';

	export let selected_project_def: ProjectDef | null = null;
	export let project_defs: ProjectDef[] = [];
	export let select_project: (id: ProjectId) => void;
	export let edit_project: (project_def: ProjectDef | null) => void;
	export let remove_project: (id: ProjectId) => void;
</script>

<menu class="projects column-sm">
	{#each project_defs as project_def (project_def.id)}
		<ProjectItem
			{project_def}
			select={select_project}
			edit={edit_project}
			remove={remove_project}
			selected={project_def === selected_project_def}
		/>
	{/each}
</menu>

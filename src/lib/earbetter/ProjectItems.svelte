<script lang="ts">
	import type { ProjectData, ProjectId, ProjectMetadata } from './project.ts';
	import ProjectItem from './ProjectItem.svelte';

	interface Props {
		selected_project_id?: ProjectId | null;
		editing_project_id?: ProjectId | null;
		projects?: Array<ProjectMetadata>;
		project_datas?: ReadonlyArray<ProjectData>;
		load_project: (id: ProjectId) => ProjectData | null;
		select_project: (id: ProjectId) => void;
		edit_project: (project_data: ProjectData | null) => void;
		remove_project: (id: ProjectId) => void;
	}

	const {
		selected_project_id = null,
		editing_project_id = null,
		projects = [],
		project_datas = [],
		load_project,
		select_project,
		edit_project,
		remove_project
	}: Props = $props();
</script>

<menu class="unstyled width_atmost_sm mb_0">
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

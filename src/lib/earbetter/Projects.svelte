<script lang="ts">
	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';
	import {AppData, DEFAULT_APP_DATA} from '$lib/earbetter/app';

	// TODO make this more controllable with props, was implemented hastily for functionality

	// TODO BLOCK refactor
	const app_data = load_from_storage(
		'app',
		() => DEFAULT_APP_DATA,
		(v) => AppData.parse(v), // TODO can we remove the fn wrapper or does it mess up `this`?
	);
	set_in_storage('app', {projects: ['ab']});
	console.log(`app_data`, app_data);
	$: ({projects} = app_data);

	// TODO BLOCK use zod schemas to validate
	// let project: ProjectDef | null = load_from_storage();
	let select_project = (id: ProjectId): void => {
		//
	};
	let edit_project = (project: ProjectDef | null): void => {
		//
	};
	let remove_project = (id: ProjectId): void => {
		//
	};
	let create_project = (project: ProjectDef): void => {
		//
	};
	let update_project = (project: ProjectDef): void => {
		//
	};

	let set_project: (leve_def: ProjectDef | null) => void;
	$: set_project?.(project);

	let id: string;
	$: editing = projects.some((d) => d.id === id);
</script>

<div class="projects">
	<header class="markup">
		<h2>projects</h2>
	</header>
	<div class="levels column-sm">
		{#each projects as p (p.id)}
			<ProjectItem
				{project}
				select={select_project}
				edit={edit_project}
				remove={remove_project}
				selected={p === project}
			/>
		{/each}
	</div>
</div>

<style>
	.projects {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-start;
	}
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: var(--spacing_md);
	}
</style>

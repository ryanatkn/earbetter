<script lang="ts">
	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';
	import ProjectItem from '$lib/earbetter/ProjectItem.svelte';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';
	import {AppData, DEFAULT_APP_DATA} from '$lib/earbetter/app';
	import ProjectForm from './ProjectForm.svelte';

	// TODO make this more controllable with props, was implemented hastily for functionality

	// TODO BLOCK refactor
	// TODO BLOCK maybe `new App(App.load())` ?
	let app_data = load_from_storage(
		'app',
		() => DEFAULT_APP_DATA,
		(v) => AppData.parse(v), // TODO can we remove the fn wrapper or does it mess up `this`?
	);
	set_in_storage('app', {projects: ['ab']});
	console.log(`app_data`, app_data);

	let selected_project_def: ProjectDef | null = null;
	let project_defs: ProjectDef[] = [];

	// TODO BLOCK use zod schemas to validate
	// let project: ProjectDef | null = load_from_storage();
	let select_project = (id: ProjectId): void => {
		//
	};
	let edit_project = (project_def: ProjectDef | null): void => {
		//
	};
	let remove_project = (id: ProjectId): void => {
		//
	};
	let create_project = (p: ProjectDef): void => {
		app_data = {...app_data, projects: app_data.projects.concat(p.id)};
		set_in_storage(p.id, p);
		project_defs = project_defs.concat(p);
		selected_project_def = p;
	};
	let update_project = (project_def: ProjectDef): void => {
		//
	};

	let set_project: (project_def: ProjectDef | null) => void;
	$: set_project?.(selected_project_def);

	let id: string;
	$: editing = project_defs.some((d) => d.id === id);
</script>

<div class="projects">
	<section class="panel padded-md column-sm">
		<header class="markup">
			<h2>projects</h2>
		</header>
		<div class="levels column-sm">
			{#each project_defs as project_def (project_def.id)}
				<ProjectItem
					{project_def}
					select={select_project}
					edit={edit_project}
					remove={remove_project}
					selected={project_def === selected_project_def}
				/>
			{/each}
		</div>
	</section>
	<section class="panel padded-md column-sm">
		<ProjectForm
			{editing}
			bind:id
			bind:set_project
			project_def={selected_project_def}
			on:submit={(editing ? update_project : create_project)
				? (e) => (editing ? update_project : create_project)?.(e.detail)
				: undefined}
			on:remove={remove_project ? (e) => remove_project?.(e.detail) : undefined}
		>
			<svelte:fragment slot="footer" let:changed>
				{#if editing && edit_project}
					<button type="button" on:click={() => play_project?.(id)}> play! </button>
					<button type="button" on:click={() => edit_project?.(null)}>
						{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
					</button>
				{/if}
			</svelte:fragment>
		</ProjectForm>
	</section>
</div>

<style>
	.projects {
		display: flex;
		flex-direction: column;
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

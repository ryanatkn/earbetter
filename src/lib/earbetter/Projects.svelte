<script lang="ts">
	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';
	import {AppData, DEFAULT_APP_DATA} from '$lib/earbetter/app';
	import ProjectForm from '$lib/earbetter/ProjectForm.svelte';
	import ProjectsList from '$lib/earbetter/ProjectsList.svelte';

	// TODO make this more controllable with props, was implemented hastily for functionality

	// TODO BLOCK refactor
	// TODO BLOCK maybe `new App(App.load())` ?
	const APP_STORAGE_KEY = 'app';
	let app_data: AppData = load_from_storage(
		APP_STORAGE_KEY,
		() => DEFAULT_APP_DATA,
		(v) => AppData.parse(v),
	);
	$: console.log(`app_data`, app_data);

	let selected_project_def: ProjectDef | null = null;
	let project_defs: ProjectDef[] = [];
	// TODO BLOCK refactor, make more efficient (save button?)
	$: set_in_storage(APP_STORAGE_KEY, (app_data = {projects: project_defs.map((p) => p.id)}));

	// let project: ProjectDef | null = load_from_storage();
	const select_project = (id: ProjectId): void => {
		selected_project_def = project_defs.find((d) => d.id === id) || null;
	};
	const edit_project = (project_def: ProjectDef | null): void => {
		selected_project_def = project_def;
	};
	const remove_project = (id: ProjectId): void => {
		if (selected_project_def?.id === id) selected_project_def = null;
		project_defs = project_defs.filter((d) => d.id !== id);
	};
	const create_project = (p: ProjectDef): void => {
		app_data = {...app_data, projects: app_data.projects.concat(p.id)};
		set_in_storage(p.id, p);
		project_defs = project_defs.concat(p);
		selected_project_def = p;
	};
	const update_project = (project_def: ProjectDef): void => {
		const {id} = project_def;
		const index = project_defs.findIndex((p) => p.id === id);
		if (index === -1) return;
		const next_project_defs = project_defs.slice();
		next_project_defs[index] = project_def;
		project_defs = next_project_defs;
		console.log(`update_project project_def`, project_def);
	};

	// TODO this or props? currently both..?
	let set_project_def: (project_def: ProjectDef | null) => void;
	$: set_project_def?.(selected_project_def);

	let id: string;
	$: editing = project_defs.some((d) => d.id === id);
</script>

<div class="projects">
	<section class="panel padded-md column-sm">
		<header class="markup">
			<h2>projects</h2>
		</header>
		<ProjectsList
			{selected_project_def}
			{project_defs}
			{select_project}
			{edit_project}
			{remove_project}
		/>
	</section>
	<section class="panel padded-md column-sm markup">
		<ProjectForm
			{editing}
			bind:id
			bind:set_project_def
			project_def={selected_project_def}
			on:submit={(editing ? update_project : create_project)
				? (e) => (editing ? update_project : create_project)?.(e.detail)
				: undefined}
			on:remove={remove_project ? (e) => remove_project?.(e.detail) : undefined}
		>
			<svelte:fragment slot="footer" let:changed>
				{#if editing && edit_project}
					<button type="button" on:click={() => edit_project?.(null)}>
						{#if changed}discard changes and stop editing{:else}stop editing this project{/if}
					</button>
				{/if}
			</svelte:fragment>
		</ProjectForm>
	</section>
</div>

<style>
	.projects {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}
</style>

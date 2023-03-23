<script lang="ts">
	import {create_project_def, type ProjectDef} from '$lib/earbetter/project';
	import ProjectForm from '$lib/earbetter/ProjectForm.svelte';
	import ProjectsList from '$lib/earbetter/ProjectsList.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		project_defs,
		selected_project_def,
		editing_project,
		editing_project_def,
		select_project,
		edit_project,
		remove_project,
		update_project,
		create_project,
	} = app);

	// TODO this or props? currently both..?
	let set_project_def: (project_def: ProjectDef | null) => void;
	$: set_project_def?.($selected_project_def);

	let id: string;
	$: editing = $project_defs.some((d) => d.id === id);
</script>

<div class="projects">
	{#if $selected_project_def}
		<section class="panel padded-md column-sm">
			<header class="markup">
				<h2>projects</h2>
			</header>
			<ProjectsList
				selected_project_def={$selected_project_def}
				project_defs={$project_defs}
				{select_project}
				edit_project={(p) => edit_project(p === $editing_project_def ? null : p)}
				{remove_project}
			/>
			<button
				class="create-new-project"
				on:click={() => {
					console.log(`$editing_project`, $editing_project);
					if ($editing_project) {
						// TODO does this logic belong in `app`? given that it has `edit_project`, seems sensible
						editing_project_def.value = null;
						editing_project.value = false;
					} else {
						editing_project_def.value = create_project_def();
						editing_project.value = true;
					}
				}}
			>
				{#if $editing_project}
					close the project editor
				{:else}
					create a new project
				{/if}
			</button>
		</section>
	{/if}
	{#if ($editing_project && $editing_project_def) || !$selected_project_def}
		<section class="panel padded-md column-sm markup">
			<ProjectForm
				{editing}
				bind:id
				bind:set_project_def
				project_def={$editing_project_def}
				on:submit={(editing ? update_project : create_project)
					? (e) => (editing ? update_project : create_project)?.(e.detail)
					: undefined}
				on:remove={remove_project ? (e) => remove_project?.(e.detail) : undefined}
			>
				<svelte:fragment slot="footer" let:changed>
					{#if editing}
						<button type="button" on:click={() => (editing_project.value = false)}>
							{#if changed}discard changes and stop editing{:else}stop editing this project{/if}
						</button>
					{/if}
				</svelte:fragment>
			</ProjectForm>
		</section>
	{/if}
</div>

<style>
	.projects {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}
	.create-new-project {
		margin: var(--spacing_md) 0;
		width: 100%;
	}
</style>
